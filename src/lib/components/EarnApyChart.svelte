<script lang="ts">
    import Chart from 'chart.js/auto';
    import {onMount} from "svelte";
    import WharfService, {rexpool, rexretpool} from "$lib/wharf";
    import {commaNumber, readableNumber} from "$lib";

    export let amount:number = 100;

    let clazz:string = '';
    export {clazz as class};

    export let width = 800;
    export let height = 140;
    let canvas, ctx, chart;

    let chartDurationInDays = 90;
    $: chartDurationReadable = (() => {
        if(chartDurationInDays < 365){
            return `${chartDurationInDays} days`;
        } else {
            return `${parseFloat(parseFloat(chartDurationInDays / 365).toFixed(1))} years`;
        }
    })();

    $: apy = (() => {
        if(!$rexpool) return 0;
        if(!$rexretpool) return 0;
        return WharfService.getApy();
    })();

    function calculateYield(stakedAmount: number, annualAPY: number, days: number): number[] {
        const dailyRate = annualAPY / 365 / 100;
        let balances = [stakedAmount];
        for (let i = 1; i <= days+1; i++) {
            const newBalance = balances[i - 1] * (1 + dailyRate);
            balances.push(newBalance);
        }
        return balances.slice(1);
    }

    $: totalStaked = (() => {
        if(!$rexpool) return 0;
        return WharfService.getTotalStaked();
    })();


    const getChartData = () => {

        const labels = Array.from({ length: chartDurationInDays }, (_, i) => `${i + 1}`);
        const datasets = calculateYield(amount, apy, chartDurationInDays)
        const datasetOfOnlyYield = datasets.map((balance, index) => {
            return balance - amount;
        });

        return {
            labels: labels,
            datasets: [{
                label: 'Yield',
                data: datasetOfOnlyYield,
                borderColor: 'rgba(255, 255, 255, 1)',
                borderWidth: 1,
                fill: true,
                lineTension: 0.1,
                pointRadius: 0.5,
            }]
        };
    }

    rexpool.subscribe(() => {
        if(chart){
            chart.data = getChartData();
            chart.update();
        }
    })

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

    $: {
        amount = amount;
        chartDurationInDays = chartDurationInDays;
        refresh();
    }

    onMount(() => {
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
                        callback: function(value) {
                            return readableNumber(value);
                        }
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
                tooltip: {
                    callbacks: {
                        title: function(tooltipItems) {
                            let title = tooltipItems[0].label;
                            return 'Day: ' + title;
                        },
                        label: function(tooltipItem) {
                            return 'Yield: ' + tooltipItem.formattedValue + ' EOS';
                        }
                    }
                }
            }
        };

        chart = new Chart(ctx, {
            type: 'line',
            data: getChartData(),
            options: options
        });
    })
</script>

<section class="{clazz} border border-white border-opacity-45 rounded p-2">
    <figure class="text-xs">Estimated yield over the next <b class="underline">{chartDurationReadable}</b> at this APY</figure>
    <section class="mt-1">
        <canvas bind:this={canvas} {width} {height}>
    </section>
    <input type="range" class="w-full h-0.5 mb-2 bg-white bg-opacity-20 rounded-lg appearance-none cursor-pointer range-sm" bind:value={chartDurationInDays} min="90" max={365*10} step="1"/>
    <section class="flex justify-between text-xs opacity-40">
        <figure>90d</figure>
        <figure>5yr</figure>
    </section>
</section>

