<script lang="ts">
    import Chart from 'chart.js/auto';
    import {onMount} from "svelte";
    import {
        blockBalances,
        blockTimestamps,
        HistoryService,
        purchases,
        rexStateHistory,
        sells
    } from "$lib/services/history";
    import {readableNumber} from "$lib";
    import {Api} from "$lib/utils/api";
    import RangeSlider from "svelte-range-slider-pips";
    import {account, rawRexBalance, rexBalance} from "$lib/services/wharf";
    import WharfService from "$lib/services/wharf.js";



    let clazz:string = '';
    export {clazz as class};

    export let width = 800;
    export let height = 140;
    let startDate = new Date();
    let endDate = new Date();
    let canvas, ctx, chart;

    // takes purchases and sells and returns a list of balances by date
    $: reducedBalancesByDate = (() => {
        const balances = [];
        for(let i = 0; i < Object.keys($blockTimestamps).length; i++){
            const block:number = Object.keys($blockTimestamps)[i];
            const timestamp = Object.values($blockTimestamps)[i];
            const balance = $blockBalances[block];
            balances.push({balance, date: new Date(timestamp).toISOString().split('T')[0]});
        }
        return balances;
    })();

    $: rawEosPurchases = (() => {
        // return 1;
        return $purchases.reduce((acc, purchase) => {
            return acc + purchase.amount;
        }, 0);
    })();

    $: earnedYieldTotal = (() => {
        if(!$rawRexBalance) return 0;
        // return 1;

        // total from sells
        const totalFromSells = $sells.reduce((acc, sell) => {
            return acc + sell.amount;
        }, 0);


        return parseFloat(WharfService.convertRexToEos(parseFloat($rawRexBalance.rex_balance.split(' ')[0]) + totalFromSells) - parseFloat(rawEosPurchases)).toFixed(4);
    })();

    const getChartData = () => {
        const timeBoxedStateHistory = $rexStateHistory.filter((state) => {
            const date = new Date(state.id);
            return date >= startDate && date <= endDate;
        });
        const labels = timeBoxedStateHistory.map((state) => {
            const date = new Date(state.id);
            return date.toLocaleDateString();
        });

        const datasets = timeBoxedStateHistory.map((state) => {
            const balance = reducedBalancesByDate.find((balance) => new Date(balance.date) >= new Date(state.id));
            return balance ? balance.balance * state.rexPrice : 0;
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

    purchases.subscribe((data) => {
        refresh();
    });

    sells.subscribe((data) => {
        refresh();
    });

    rexStateHistory.subscribe((data) => {
        if(data.length > 0){
            startDate = new Date(data[0].id);
            endDate = new Date(data[data.length - 1].id);
        }
        refresh();
    });

    // account.subscribe(async (data) => {
    //     if(data){
    //         await HistoryService.getHistory();
    //         refresh();
    //     }
    // });

    onMount(async () => {

        const history = await Api.get('/api/get-rex-price-history');
        if(!history.error){
            rexStateHistory.set(history.data);
        }
        // await HistoryService.getHistory();

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
                            const middleTick = Math.floor(totalTicks / 2);
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
            <figure class="text-sm font-black -mt-1">over the past 30 days</figure>
        </section>
<!--        <section class="max-lg:mt-4">-->
<!--            <figure class="text-sm font-black">You've invested</figure>-->
<!--            <h1 class="text-yellow-300 text-3xl font-black -mt-1 text-shadow">{rawEosPurchases} EOS</h1>-->
<!--        </section>-->
<!--        <section class="lg:text-right max-lg:mt-4">-->
<!--            <figure class="text-sm font-black">You've made</figure>-->
<!--            <h1 class="text-yellow-300 text-3xl font-black -mt-1 text-shadow">{earnedYieldTotal} EOS</h1>-->
<!--        </section>-->
    </section>

    <section class="mt-1">
        <canvas bind:this={canvas} {width} {height} />
    </section>

    <!-- range from start date to end date -->
<!--    <input type="range" min={startDate.getTime()} max={endDate.getTime()} step={86400000} on:input={dateRangeChanged} />-->
    {#if $rexStateHistory.length > 0}
        <RangeSlider values={[startDate.getTime(), endDate.getTime()]}
                 min={+new Date($rexStateHistory[0].id)}
                 max={+new Date($rexStateHistory[$rexStateHistory.length - 1].id)}
                 step={86400000}
                 pips range on:change={dateRangeChanged}
                     all="1"
                     hoverable={false}
        />
    {/if}
</section>

