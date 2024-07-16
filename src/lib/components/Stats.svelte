<script>
    import GlassBox from "$lib/components/GlassBox.svelte";
    import ApyChart from "$lib/components/ApyChart.svelte";
    import WharfService, {eosPrice, rexpool, rexretpool} from "$lib/wharf";
    import {readableNumber} from "$lib";
    import EOS from "$lib/svgs/EOS.svelte";
    import InfoBox from "$lib/components/InfoBox.svelte";

    $: apy = (() => {
        if(!$rexpool) return 0;
        if(!$rexretpool) return 0;
        return WharfService.getApy();
    })();

    $: totalStaked = (() => {
        if(!$rexpool) return 0;
        return WharfService.getTotalStaked();
    })();
</script>

<GlassBox class="mt-2 overflow-hidden">

    <section class="flex justify-between relative max-lg:flex-col">
        <section class="max-lg:mt-4">
            <figure class="text-sm font-black">~Daily Yield</figure>
            <h1 class="text-yellow-300 text-3xl font-black -mt-1 text-shadow">{parseFloat(apy/365).toFixed(3)}%</h1>
        </section>
        <section class="lg:text-right max-lg:mt-4">
            <figure class="text-sm font-black">~Annual Yield 🔥</figure>
            <h1 class="text-yellow-300 text-3xl font-black -mt-1 text-shadow">{apy}%</h1>
        </section>
    </section>

    <section class="flex justify-between relative max-lg:flex-col mt-5">
        <section>
            <figure class="text-sm">TVL (EOS)</figure>
            <h1 class="text-3xl font-bold -mt-1 flex">
                <EOS width={16} class="mr-1" />
                {readableNumber(totalStaked)}</h1>
        </section>
        <section class="lg:text-right max-lg:mt-4">
            <figure class="text-sm">TVL (USD)</figure>
            <h1 class="text-3xl font-bold -mt-1">${readableNumber(totalStaked * $eosPrice)}</h1>
        </section>
    </section>

    <section class="mt-10">
        <figure class="text-xl font-bold text-center">
            Staked EOS (TVL) vs APY
        </figure>
        <figure class="text-sm text-center">
            The yellow dot below shows what the APY will be once reaching the next TVL target.
            As more EOS is staked, the APY will decrease.
        </figure>
    </section>

    <ApyChart class="mt-4" />

    <InfoBox class="-mt-2 mb-10">
        The first month (8/7/2024-8/8/2024) of the staking program has slightly higher APY due to some doubling of rewards so the graph will show a lower APY than
        what you are receiving.
    </InfoBox>

    <figure class="text-xl font-bold text-center">
        Staked EOS (TVL)
    </figure>
    <iframe class="w-full aspect-video" src="https://defillama.com/chart/protocol/eos-rex?denomination=EOS&theme=dark" title="DefiLlama" frameborder="0"></iframe>
    <figure class="text-sm text-center mt-2">
        <a href="https://defillama.com/protocol/eos-rex?denomination=EOS" target="_blank" rel="noopener" class="text-yellow-400 underline">View on DefiLlama</a>
    </figure>
</GlassBox>
