<script lang="ts">
    import Chart from 'chart.js/auto';
    import {onMount} from "svelte";
    import {
        HistoryService,
        rexStateHistory,
        userActions
    } from "$lib/services/history";
    import {readableNumber} from "$lib";
    import {Api} from "$lib/utils/api";
    import RangeSlider from "svelte-range-slider-pips";
    import {account, rawRexBalance, rexBalance, rexpool} from "$lib/services/wharf";
    import WharfService from "$lib/services/wharf.js";
    import {toast} from "svelte-sonner";
    import {UserRexActionType} from "$lib/models/UserRexAction";



    let clazz:string = '';
    export {clazz as class};

    export let width = 800;
    export let height = 140;
    let startDate = new Date();
    let endDate = new Date();
    let canvas, ctx, chart;
    let showOnlyRewards = true;
    let firstLoad = true;

    // takes purchases and sells and returns a list of balances by date
    $: balanceByDate = (() => {
        const balances = [];

        const ascendingActions = $userActions.sort((a, b) => +new Date(a.date) - +new Date(b.date));

        for(let action of ascendingActions){
            if(action.type === UserRexActionType.Purchase){
                const balance = balances.length ? balances[balances.length - 1].balance + action.rex : action.rex;
                const eosBalance = balances.length ? balances[balances.length - 1].eos + action.eos : action.eos;
                balances.push({balance, eos:eosBalance, date: new Date(action.date).toISOString().split('T')[0]});
            } else if(action.type === UserRexActionType.Sell){
                const balance = balances.length ? balances[balances.length - 1].balance - action.rex : 0;
                const eosBalance = balances.length ? balances[balances.length - 1].eos - action.eos : 0;
                balances.push({balance, eos:eosBalance, date: new Date(action.date).toISOString().split('T')[0]});
            }
        }

        // if there are multiple actions on the same day, remove all but the last one
        for(let i = 0; i < balances.length; i++){
            const current = balances[i];
            const next = balances[i + 1];
            if(next && current.date === next.date){
                balances.splice(i, 1);
                i--;
            }
        }

        return balances;
    })();

    $: rawEosPurchases = (() => {
        return $userActions.filter(x => x.type === UserRexActionType.Purchase).reduce((acc, purchase) => {
            return acc + purchase.eos;
        }, 0);
    })();

    $: earnedYieldTotal = (() => {
        if(!$rawRexBalance) return 0;
        if(!$userActions) return 0;
        if(!rawEosPurchases) return 0;

        const totalFromSells = $userActions.filter(x => x.type === UserRexActionType.Sell).reduce((acc, sell) => {
            return acc + sell.rex;
        }, 0);

        return parseFloat(
            (WharfService.convertRexToEos(
                parseFloat($rawRexBalance.rex_balance.split(' ')[0]) + totalFromSells
            ) - parseFloat(rawEosPurchases)).toString()
        ).toFixed(4);
    })();

    $: rexStateHistoryWithToday = (() => {
        if(!$rexStateHistory) return [];
        if(!$rexpool) return $rexStateHistory;

        let history:any = $rexStateHistory;
        const todaysDate = new Date().toISOString().split('T')[0];
        const index = history.findIndex(x => x.id === todaysDate);
        if(index === -1){
            const price = WharfService.convertRexToEos(1);
            history.push({id: todaysDate, rexPrice: price});
        }

        return history;
    })();

    const getChartData = () => {
        const timeBoxedStateHistory = rexStateHistoryWithToday.filter((state) => {
            const date = new Date(state.id);
            return date >= startDate && date <= endDate;
        });
        const labels = timeBoxedStateHistory.map((state) => {
            const date = new Date(state.id);
            return date.toLocaleDateString();
        });

        const datasets = timeBoxedStateHistory.map((state, index) => {
            const balances = balanceByDate
                // find all dates higher than the current state date
                .filter((balance) => +new Date(balance.date) <= +new Date(state.id))
                // sort by date
                .sort((a, b) => +new Date(a.date) - +new Date(b.date));
            const balance = balances.length ? balances[balances.length-1].balance * state.rexPrice : 0;
            const eosBalance = balances.length ? balances[balances.length-1].eos : 0;

            if(!showOnlyRewards){
                return balance;
            }
            // just show the current earned yield if we're at the last state
            // as it's sometimes incorrect due to precision issues
            if(index === timeBoxedStateHistory.length - 1){
                return earnedYieldTotal;
            }

            return balance - eosBalance;
        });

        return {
            labels: labels,
            datasets: [{
                label: 'EOS',
                data: datasets,
                borderColor: 'rgba(255, 255, 255, 1)',
                borderWidth: 1,
                fill: true,
                lineTension: 0.1,
                pointRadius: 0.5,
            }]
        };
    }

    let refreshTimeout;
    const refresh = () => {
        if(refreshTimeout) clearTimeout(refreshTimeout);
        refreshTimeout = setTimeout(() => {
            if(chart){
                chart.data = getChartData();
                chart.update();
            }
        }, 200);
    }

    userActions.subscribe((data) => {
        refresh();
    });

    rexStateHistory.subscribe((data) => {
        if(data.length > 0){
            startDate = new Date(data[0].id);
        }
        refresh();
    });

    const getUserHistory = async () => {
        if($account){
            const result = await Api.post('/api/get-rex-account-history', {account: $account});
            if(result.error){
                console.error(result);
                toast.error(result.data);
                return;
            }

            userActions.set(result.data);
            refresh();
        }
    }

    account.subscribe(async (data) => {
        await getUserHistory();
    });

    onMount(async () => {
        const history = await Api.get('/api/get-rex-price-history');
        if(!history.error){
            rexStateHistory.set(history.data);
        } else {
            toast.error(history.data);
            return;
        }

        ctx = canvas.getContext('2d');

        const options = {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    title: {
                        display: false,
                        color: '#FFFFFF',
                    },
                    ticks: {
                        color: '#FFFFFF',
                        // only show middle, first and last tick
                        callback: function(value, index, ticks) {
                            const totalTicks = ticks.length;
                            const middleTick = Math.floor(totalTicks / 2)+1;
                            if (index === 0 || index === middleTick-1 || index === totalTicks - 1) {
                                return this.getLabelForValue(value);
                            }
                            return null;
                        }
                    },
                    grid: {
                        color: 'rgba(255, 99, 132, 0.3)',
                        display: true
                    }
                },
                y: {
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.4)',
                    },
                    grid: {
                        display: false
                    }
                }
            },
            interaction: {
                mode: 'nearest',
                axis: 'xy',
                intersect: false
            },
            plugins: {
                legend: {
                    display: false
                },
            }
        };

        chart = new Chart(ctx, {
            type: 'line',
            data: getChartData(),
            options
        });
    })

    const dateRangeChanged = (e) => {
        const date = new Date(e.detail.value);
        if(e.detail.activeHandle === 0){
            date.setUTCHours(0, 0, 0, 0);
            startDate = date;
        } else {
            date.setUTCHours(23, 59, 59, 999);
            endDate = date;
        }

        refresh();
    }

</script>



<section class="{clazz} border border-white border-opacity-45 rounded p-2 mb-4">
    <section class="flex justify-between relative max-lg:flex-col">
        <section class="max-lg:mt-4">
            <figure class="text-sm font-black">You've made</figure>
            <h1 class="text-yellow-300 text-3xl font-black -mt-1 text-shadow">{earnedYieldTotal} EOS</h1>
            {#if $rexStateHistory.length}
                <figure class="text-sm font-black -mt-1">since {new Date($rexStateHistory[0].id).toLocaleDateString()}</figure>
            {/if}
        </section>
    </section>

    <section class="mt-1">
        <canvas bind:this={canvas} {width} {height} />
    </section>

    {#if $rexStateHistory.length > 0}
        <RangeSlider values={[startDate.getTime(), endDate.getTime()]}
                 min={+new Date($rexStateHistory[0].id)}
                 max={+new Date($rexStateHistory[$rexStateHistory.length - 1].id)}
                 step={86400000}
                 pips range on:change={dateRangeChanged}
                     all="1"
                     hoverable={false}
        />

        <section class="flex gap-2 items-center justify-center">
            <input type="checkbox" on:change={refresh} bind:checked={showOnlyRewards} class="form-checkbox h-5 w-5 text-yellow-300 text-right" />
            <figure class="text-xs font-bold">Show only earned from yield</figure>
        </section>
    {/if}
</section>
