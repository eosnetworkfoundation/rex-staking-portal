import {Session, SessionKit, Chains} from "@wharfkit/session"
import { APIClient, Asset, Int64 } from "@wharfkit/antelope"
import {get, writable, type Writable} from "svelte/store";
import {TransactPluginResourceProvider} from "@wharfkit/transact-plugin-resource-provider";
import { WalletPluginAnchor } from "@wharfkit/wallet-plugin-anchor"
import { toast } from 'svelte-sonner'
import {showConfetti} from "$lib/index";

export let loadingFromChain:Writable<boolean> = writable(false);
export let account:Writable<string|null> = writable(null);
export let eosBalance:Writable<number> = writable(0);
export let rexBalance:Writable<number> = writable(0);
export let rexfund:Writable<any> = writable(null);
export let rexpool:Writable<any> = writable(null);
export let rexretpool:Writable<any> = writable(null);
export let rawRexBalance:Writable<any> = writable(null);

const chains = [
    Chains.EOS,
    Chains.Jungle4,
    Chains.KylinTestnet,
];

export interface UnstakingBalance {
    rex: number;
    date: Date;
    savings:boolean;
}
export let unstakingBalances:Writable<UnstakingBalance[]> = writable([]);

const success = (msg:string) => {
    showConfetti.set(true);
    toast.success(msg);
    WharfService.delayedRefresh();
    setTimeout(() => showConfetti.set(false), 1500);
}

export default class WharfService {
    public static sessionKit:SessionKit|null = null;
    public static session:Session|null = null;
    public static client:APIClient|null = null;

    static async init(){
        const { WebRenderer } = await import("@wharfkit/web-renderer");
        const { WalletPluginScatter } = await import("@wharfkit/wallet-plugin-scatter");
        const { WalletPluginWombat } = await import("@wharfkit/wallet-plugin-wombat");
        const { WalletPluginTokenPocket } = await import("@wharfkit/wallet-plugin-tokenpocket");
        WharfService.sessionKit = new SessionKit({
                appName: "eosstaking",
                chains,
                ui: new WebRenderer(),
                walletPlugins: [
                    new WalletPluginAnchor(),
                    new WalletPluginScatter(),
                    new WalletPluginWombat(),
                    new WalletPluginTokenPocket(),
                ],
            },
            {
                transactPlugins: [new TransactPluginResourceProvider()],
            })

        WharfService.client = new APIClient({
            url: Chains.EOS.url
        })

        const _rexpool = await WharfService.getRexPool();
        if(_rexpool) rexpool.set(_rexpool);

        const _rexretpool = await WharfService.getRexRetPool();
        if(_rexretpool) rexretpool.set(_rexretpool);

        const session = await WharfService.sessionKit.restore()
        if(session) {
            WharfService.session = session
            account.set(session.actor.toString())
            setTimeout(() => WharfService.refresh());
        }
    }

    static async login(){
        if(!WharfService.sessionKit) await WharfService.init();
        WharfService.session = (x => x ? x.session : null)(await WharfService.sessionKit?.login().catch(err => {
            console.error('login error', err)
            return null;
        }))

        account.set(
            WharfService.session
                ? WharfService.session.actor.toString()
                : null
        )

        setTimeout(() => WharfService.refresh());
    }

    static async logout(){
        await WharfService.sessionKit?.logout()
        account.set(null)
        eosBalance.set(0)
        rexBalance.set(0)
        rexfund.set(null)
        unstakingBalances.set([])
        rawRexBalance.set(null)
    }

    static async refresh(){

        if (!WharfService.session) return;

        const _eosBalance = await WharfService.getEosBalance();
        if(_eosBalance) eosBalance.set(_eosBalance);

        const _rexpool = await WharfService.getRexPool();
        if(_rexpool) rexpool.set(_rexpool);

        const _rexretpool = await WharfService.getRexRetPool();
        if(_rexretpool) rexretpool.set(_rexretpool);

        await WharfService.getRexFund();

        const _unstakingBalances = await WharfService.getUnstakingBalances();
        if(_unstakingBalances) {
            unstakingBalances.set(_unstakingBalances);
            const savings = _unstakingBalances.find((x:any) => x.savings);
            if(savings) rexBalance.set(parseFloat(savings.rex));
        }
    }

    static delayedRefresh(){
        setTimeout(() => WharfService.refresh(), 1000);
    }

    static convertEosToRex(eos:number){
        const pool = get(rexpool);
        if(!pool) return 0;
        const S0 = parseFloat(pool.total_lendable.split(' ')[0]);
        const S1 = S0 + eos;
        const R0 = parseFloat(pool.total_rex.split(' ')[0]);
        const R1 = (S1 * R0) / S0;
        return parseFloat(parseFloat((R1 - R0).toString()).toFixed(4));
    }

    static convertRexToEos(rex:number){
        const pool = get(rexpool);
        if(!pool) return 0;
        const S0 = parseFloat(pool.total_lendable.split(' ')[0]);
        const R0 = parseFloat(pool.total_rex.split(' ')[0]);
        const R1 = R0 + rex;
        const S1 = (S0 * R1) / R0;
        return parseFloat(parseFloat((S1 - S0).toString()).toFixed(4));
    }

    static async getEosBalance(){
        if (!WharfService.session) return;

        return WharfService.session?.client.v1.chain.get_table_rows({
            code: "eosio.token",
            scope: WharfService.session.actor,
            table: "accounts",
            json: true,
        }).then((res:any) => {
            const row = res.rows.find((row:any) => row.balance.split(' ')[1] === 'EOS');
            return row ? parseFloat(row.balance.split(' ')[0]) : 0;
        }).catch(err => {
            console.error(err)
            toast.error('There was a problem getting your EOS balance. Check the console for more information about what happened.')
            return null;
        });
    }

    static async getUnstakingBalances(){
        if (!WharfService.session) return;

        const fiveYearsFromNow = new Date().getTime() + 1000 * 60 * 60 * 24 * 365 * 5;

        return WharfService.session?.client.v1.chain.get_table_rows({
            code: "eosio",
            scope: "eosio",
            lower_bound: WharfService.session.actor,
            upper_bound: WharfService.session.actor,
            table: "rexbal",
            json: true,
        }).then((res:any) => {
            const row = res.rows.find((row:any) => row.owner === WharfService.session?.actor.toString());
            if(!row) return [];

            rawRexBalance.set(row);

            return row.rex_maturities.map((maturity:any) => ({
                rex: parseFloat((parseInt(maturity.second)/10000).toString()).toFixed(4),
                date: new Date(maturity.first),
                savings: +new Date(maturity.first) > +fiveYearsFromNow,
            }));
        }).catch(err => {
            console.error(err)
            toast.error('There was a problem getting your REX balance. Check the console for more information about what happened.')
            return null;
        });
    }

    static async getRexFund(){
        if (!WharfService.session) return;


        return WharfService.session?.client.v1.chain.get_table_rows({
            code: "eosio",
            scope: "eosio",
            lower_bound: WharfService.session.actor,
            upper_bound: WharfService.session.actor,
            table: "rexfund",
            json: true,
        }).then((res:any) => {
            const row = res.rows.find((row:any) => row.owner === WharfService.session?.actor.toString());
            if(!row) return null;

            rexfund.set(parseFloat(row.balance.split(' ')[0]));
            return true;
        }).catch(err => {
            console.error(err)
            toast.error('There was a problem getting your REX fund balance. Check the console for more information about what happened.')
            return null;
        });
    }

    static async getRexPool(){
        if(!WharfService.session && !WharfService.client) return;

        let client = WharfService.session
            ? WharfService.session.client
            : WharfService.client;

        return client!.v1.chain.get_table_rows({
            code: "eosio",
            scope: "eosio",
            table: "rexpool",
            json: true,
        }).then((res:any) => {
            return res.rows[0];
        }).catch(err => {
            console.error(err)
            toast.error('There was a problem getting the REX pool. Check the console for more information about what happened.')
            return null;
        });
    }

    static async getRexRetPool(){
        if(!WharfService.session && !WharfService.client) return;

        let client = WharfService.session
            ? WharfService.session.client
            : WharfService.client;

        return client!.v1.chain.get_table_rows({
            code: "eosio",
            scope: "eosio",
            table: "rexretpool",
            json: true,
        }).then((res:any) => {
            return res.rows[0];
        }).catch(err => {
            console.error(err)
            toast.error('There was a problem getting the REX return pool. Check the console for more information about what happened.')
            return null;
        });
    }

    static getApy(){
        if(!get(rexpool)) return 0;
        if(!get(rexretpool)) return 0;

        // {
        //     const pool = get(rexpool);
        //
        //     // Instead of trying to fetch & calculate the annual reward, we know that it will be 31,250,000 EOS
        //     // for the new tokenomics, so we can just divide that by the total staked, the only inconsistency will
        //     // be that on testnets there will be an incorrect APY, but that's fine.
        //     const annualReward = 31250000;
        //     const totalStaked = parseInt(pool.total_lendable.split(' ')[0]);
        //     return parseFloat(((annualReward / totalStaked) * 100).toString()).toFixed(2);
        // }
        {
            const pool = get(rexpool);
            const retpool = get(rexretpool);

            const total_lendable = Asset.fromString(pool.total_lendable).units.toNumber();
            const current_rate_of_increase = Int64.from(retpool.current_rate_of_increase).toNumber();
            const proceeds = Int64.from(retpool.proceeds).toNumber();
            return parseFloat(((proceeds + current_rate_of_increase) / 30 * 365) / total_lendable * 100).toFixed(2);
        }
    }

    static async buyRex(eos:number){
        if (!WharfService.session) return;

        if(eos <= 0) {
            toast.error('You must enter a positive amount of EOS to buy REX.')
            return null;
        }

        const amount = `${eos.toFixed(4)} EOS`

        const actions:any[] = [
            {
                account: "eosio",
                name: "deposit",
                authorization: [WharfService.session?.permissionLevel],
                data: {
                    owner: WharfService.session?.actor,
                    amount
                }
            },
            {
                account: "eosio",
                name: "buyrex",
                authorization: [WharfService.session?.permissionLevel],
                data: {
                    from: WharfService.session?.actor,
                    amount
                }
            }
        ];

        const claimableBalance = WharfService.claimableBalance();
        if(claimableBalance > 0 && claimableBalance < 10000){
            actions.unshift({
                account: "eosio",
                name: "mvtosavings",
                authorization: [WharfService.session?.permissionLevel],
                data: {
                    owner: WharfService.session?.actor,
                    rex: `${claimableBalance.toFixed(4)} REX`
                }
            });
        }

        return WharfService.session?.transact({
            actions
        } as any).then(x => {
            success(`Successfully staked ${eos} EOS!`);
            return x;
        }).catch(err => {
            console.error(err)
            toast.error(`There was a problem buying REX. ${err}`)
            return null;
        });
    }

    static async unstake(rex:number){
        if (!WharfService.session) return;

        if(rex <= 0) {
            toast.error('You must enter a positive amount to unstake.')
            return null;
        }

        const balance = get(rexBalance);
        if(balance < rex){
            // check if within a reasonable margin of error
            // if so, then just normalize to their max balance
            if(Math.abs(balance - rex) <= 10) {
                rex = balance;
            } else {
                toast.error('You do not have enough to unstake that amount.')
                return null;
            }
        }

        return WharfService.session?.transact({
            actions: [
                {
                    account: "eosio",
                    name: "mvfrsavings",
                    authorization: [WharfService.session?.permissionLevel],
                    data: {
                        owner: WharfService.session?.actor,
                        rex: `${rex.toFixed(4)} REX`
                    }
                }
            ]
        } as any).then(x => {
            success(`Successfully unstaked ${WharfService.convertRexToEos(rex)} EOS!`);
            return x;
        }).catch(err => {
            console.error(err)
            toast.error(`There was a problem unstaking REX. ${err}`)
            return null;
        });
    }

    static pendingClaimableBalances(){
        const now = +new Date();
        return get(unstakingBalances).filter(x => {
            return +x.date >= now;
        });
    }

    static claimableBalances(){
        const now = +new Date();
        return get(unstakingBalances).filter(x => {
            return +x.date < now;
        });
    }

    static withdrawableBalance(_claimable:number|null = null){
        const claimable = _claimable ? _claimable : WharfService.claimableBalance();
        const withdrawable = parseFloat(get(rexfund) ?? 0);
        const matured = parseFloat(WharfService.convertRexToEos(claimable).toString());
        return parseFloat((withdrawable + matured).toString()).toFixed(4);
    }

    static claimableBalance(){
        const maturedRex = get(rawRexBalance) ? get(rawRexBalance).matured_rex / 10000 : 0;
        return maturedRex + WharfService.claimableBalances().reduce((acc, x) => acc + parseFloat(x.rex.toString()), 0);
    }

    static async claim(){
        const claimable = WharfService.claimableBalance();
        const totalEos = WharfService.withdrawableBalance(claimable);

        if(parseFloat(totalEos) <= 0){
            toast.error('You have no rewards to claim.')
            return null;
        }

        const actions:any[] = [
            {
                account: "eosio",
                name: "withdraw",
                authorization: [WharfService.session?.permissionLevel],
                data: {
                    owner: WharfService.session?.actor,
                    amount: `${totalEos} EOS`
                }
            }
        ]

        if(claimable > 0){
            actions.unshift({
                account: "eosio",
                name: "sellrex",
                authorization: [WharfService.session?.permissionLevel],
                data: {
                    from: WharfService.session?.actor,
                    rex: `${claimable.toFixed(4)} REX`
                },
            })
        }

        return WharfService.session?.transact({
            actions: actions as any
        }).then(x => {
            success(`Successfully claimed ${totalEos} EOS!`);
            return x;
        }).catch(err => {
            console.error(err)
            toast.error(`There was a problem claiming rewards. ${err}`)
            return null;
        });
    }
}
