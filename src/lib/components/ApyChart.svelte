<script lang="ts">
    import Chart from 'chart.js/auto';
    import {onMount} from "svelte";
    import WharfService, {rexpool} from "$lib/services/wharf";


    let clazz:string = '';
    export {clazz as class};

    export let width = 800;
    export let height = 200;
    let canvas, ctx, chart;

    function calculateAPY(stakedAmount:number) {
        const totalEmissions = 31250000; // 31.25M EOS annually
        return (totalEmissions / stakedAmount) * 100;
    }

    $: totalStaked = (() => {
        if(!$rexpool) return 0;
        return WharfService.getTotalStaked();
    })();

    const getChartData = () => {
        const labels = Array.from({length: 15}, (_, i) => (i + 1) * 50);
        const datasets = labels.map(stakedAmount => calculateAPY(stakedAmount*1000000));
        const totalStakedIndex = labels.findIndex(label => label > totalStaked/1000000);

        const lineColor = 'white';
        const dotColor = 'rgba(255,255, 255, 0.2)';
        const targetDotColor = 'yellow';

        return {
            labels: labels.map(label => `${label}M`),
            datasets: [{
                label: 'Estimated APY (%)',
                data: datasets,
                borderColor: lineColor,
                borderWidth: 2,
                fill: false,
                lineTension: 0.1,
                pointBackgroundColor: datasets.map((_, index) => index === totalStakedIndex ? targetDotColor : dotColor),
                pointBorderColor: datasets.map((_, index) => index === totalStakedIndex ? targetDotColor : dotColor),
                pointRadius: datasets.map((_, index) => index === totalStakedIndex ? 5 : 5),
            }]
        };
    }

    rexpool.subscribe(() => {
        if(chart){
            chart.data = getChartData();
            chart.update();
        }
    })

    onMount(() => {
        ctx = canvas.getContext('2d');



        // Options for the chart
        const options = {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    title: {
                        display: true,
                        color: '#FFFFFF',
                    },
                    ticks: {
                        color: '#FFFFFF'
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
            plugins: {
                legend: {
                    display: false
                },
            }
        };

        // Create the chart
        chart = new Chart(ctx, {
            type: 'line',
            data: getChartData(),
            options: options
        });
    })
</script>

<section class="{clazz}">
    <canvas bind:this={canvas} {width} {height} />


</section>

