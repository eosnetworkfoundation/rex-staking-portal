<script>
    import GlassBox from "$lib/components/GlassBox.svelte";
    import ApyChart from "$lib/components/ApyChart.svelte";
    import WharfService, {eosPrice, rexpool, rexretpool} from "$lib/wharf";
    import {readableNumber} from "$lib";
    import EOS from "$lib/svgs/EOS.svelte";

    console.log('$eosPrice', $eosPrice)

    $: apy = (() => {
        if(!$rexpool) return 0;
        if(!$rexretpool) return 0;
        return WharfService.getApy();
    })();

    $: totalStaked = (() => {
        if(!$rexpool) return 0;
        if(!$rexretpool) return 0;
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

    <iframe class="w-full aspect-video" src="https://defillama.com/chart/protocol/eos-rex?denomination=EOS&theme=dark" title="DefiLlama" frameborder="0"></iframe>
</GlassBox>
