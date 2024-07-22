import {get, writable, type Writable} from "svelte/store";
import { toast } from 'svelte-sonner'
import WharfService, {account} from "$lib/services/wharf";
import type {RexDateState} from "$lib/models/RexDateState";

export interface PurchaseOrSell {
    amount: number;
    trx_id: string;
    timestamp: string;
    block_id: string;
    block_num: number;
}

export let purchases: Writable<PurchaseOrSell[]> = writable([]);
export let sells: Writable<PurchaseOrSell[]> = writable([]);
export let blockPrices: Writable<any> = writable({});
export let blockBalances: Writable<any> = writable({});
export let blockTimestamps: Writable<any> = writable({});
export let rexStateHistory: Writable<RexDateState[]> = writable([]);

const HYPERION_BASE = 'https://eos.hyperion.eosrio.io';

export class HistoryService {
    static async getHistory(){
        if(!get(account)) return;
        await this.getPurchases(get(account));
        await this.getSells(get(account));
    }

    static async getPurchases(account:string){
        const url = new URL(`${HYPERION_BASE}/v2/history/get_actions`);
        url.searchParams.append('account', account);
        url.searchParams.append('filter', 'eosio:buyrex');
        url.searchParams.append('skip', '0');
        url.searchParams.append('limit', '100');
        url.searchParams.append('sort', 'desc');
        const result = await fetch(url.toString()).then(res => res.json());
        if(result.actions && result.actions.length){
            purchases.set(result.actions.map((action: any) => {
                const data = action.act.data;
                blockTimestamps.update((timestamps) => {
                    timestamps[action.block_num] = +new Date(action.timestamp);
                    return timestamps;
                });
                return {
                    amount: parseFloat(data.amount.split(' ')[0]),
                    trx_id: action.trx_id,
                    timestamp: action.timestamp,
                    block_id: action.block_id,
                    block_num: action.block_num
                }
            }));

            for(let i = 0; i < get(purchases).length; i++){
                const block = get(purchases)[i].block_num;
                await this.fillBlockData(block);
            }
        }
    }

    static async getSells(account:string){
        const url = new URL(`${HYPERION_BASE}/v2/history/get_actions`);
        url.searchParams.append('account', account);
        url.searchParams.append('filter', 'eosio:sellrex');
        url.searchParams.append('skip', '0');
        url.searchParams.append('limit', '100');
        url.searchParams.append('sort', 'desc');
        const result = await fetch(url.toString()).then(res => res.json());
        if(result.actions && result.actions.length){
            sells.set(result.actions.map((action: any) => {
                const data = action.act.data;
                blockTimestamps.update((timestamps) => {
                    timestamps[action.block_num] = +new Date(action.timestamp);
                    return timestamps;
                });
                return {
                    amount: parseFloat(data.rex.split(' ')[0]),
                    trx_id: action.trx_id,
                    timestamp: action.timestamp,
                    block_id: action.block_id,
                    block_num: action.block_num
                }
            }));

            for(let i = 0; i < get(sells).length; i++){
                const block = get(sells)[i].block_num;
                await this.fillBlockData(block);
            }
        }
    }

    static async fillBlockData(block:number){
        if(!get(blockPrices)[block]){
            const price = await this.getPriceForBlock(block);
            if(price){
                blockPrices.update((prices) => {
                    prices[block] = price;
                    return prices;
                });
            }
        }

        if(!get(blockBalances)[block]){
            const balance = await this.getBalanceForBlock(block, get(account));
            if(balance){
                blockBalances.update((balances) => {
                    balances[block] = balance;
                    return balances;
                });
            }
        }
    }

    static async getBalanceForBlock(block:number, account:string){
        const url = new URL(`${HYPERION_BASE}/v2/history/get_deltas`);
        url.searchParams.append('code', 'eosio');
        url.searchParams.append('table', 'rexbal');
        url.searchParams.append('payer', account);
        url.searchParams.append('block_num', block.toString());
        const result = await fetch(url.toString()).then(res => res.json());

        if(result.deltas && result.deltas.length){
            const balance = result.deltas[0].data;
            return parseFloat(balance.rex_balance.split(' ')[0]);
        }
    }

    static async getBlockRexState(buyrexBlock:number, donaterexBlock:number) {

        let pool;
        let retpool;

        {
            const url = new URL(`${HYPERION_BASE}/v2/history/get_deltas`);
            url.searchParams.append('code', 'eosio');
            url.searchParams.append('table', 'rexpool');
            url.searchParams.append('block_num', buyrexBlock.toString());
            const result = await fetch(url.toString()).then(res => res.json());

            if(result.deltas && result.deltas.length){
                pool = result.deltas[0].data;
            }
        }

        {
            const url = new URL(`${HYPERION_BASE}/v2/history/get_deltas`);
            url.searchParams.append('code', 'eosio');
            url.searchParams.append('table', 'rexretpool');
            url.searchParams.append('block_num', donaterexBlock.toString());
            const result = await fetch(url.toString()).then(res => res.json());

            if(result.deltas && result.deltas.length){
                retpool = result.deltas[0].data;
            }
        }

        return {
            pool,
            retpool
        }

    }

    static async getPriceForBlock(block:number){
        const url = new URL(`${HYPERION_BASE}/v2/history/get_deltas`);
        url.searchParams.append('code', 'eosio');
        url.searchParams.append('table', 'rexpool');
        url.searchParams.append('block_num', block.toString());
        const result = await fetch(url.toString()).then(res => res.json());

        if(result.deltas && result.deltas.length){
            const pool = result.deltas[0].data;
            const S0 = parseFloat(pool.total_lendable.split(' ')[0]);
            const R0 = parseFloat(pool.total_rex.split(' ')[0]);
            const R1 = R0 + 1;
            const S1 = (S0 * R1) / R0;
            return parseFloat(parseFloat((S1 - S0).toString()).toFixed(10));
        }

        return null;
    }

    static async findBlockForDate(date: number, filter:string = 'eosio:buyrex'){
        // use /v2/history/get_actions to find a block that has a buyrex action between the start of the date day, and the end of the date day
        const url = new URL(`${HYPERION_BASE}/v2/history/get_actions`);
        url.searchParams.append('account', 'eosio');
        url.searchParams.append('filter', filter);
        url.searchParams.append('skip', '0');
        url.searchParams.append('limit', '1');

        // get the 00:00:00 utc start time
        const startOfDay = new Date(date);
        startOfDay.setUTCHours(0, 0, 0, 0);
        url.searchParams.append('after', startOfDay.toISOString()); // ISO8601 format dates

        // get the 23:59:59 utc end time
        const endOfDay = new Date(date);
        endOfDay.setUTCHours(23, 59, 59, 999);
        url.searchParams.append('before', endOfDay.toISOString());

        const result = await fetch(url.toString()).then(res => res.json());
        if(!result.actions || !result.actions.length) return null;
        return result.actions[0].block_num;
    }


}