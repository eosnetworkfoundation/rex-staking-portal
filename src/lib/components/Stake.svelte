<script>
    import WharfService, {account, eosBalance, rexpool} from "$lib/wharf";
    import TokenInput from "$lib/components/TokenInput.svelte";
    import InfoRows from "$lib/components/InfoRows.svelte";
    import GlassBox from "$lib/components/GlassBox.svelte";
    import {commaNumber, readableNumber} from "$lib";
    import LoadingSpinner from "$lib/components/LoadingSpinner.svelte";
    import InfoBox from "$lib/components/InfoBox.svelte";
    import {toast} from "svelte-sonner";

    let amount = 0;
    $: rexReturn = WharfService.convertEosToRex(amount);
    $: apy = (() => {
        if(!$rexpool) return 0;
        return WharfService.getApy();
    })();

    let loading = false;
    const buy = async () => {
        if(!$account){
            return WharfService.login();
        }
        if (loading) return;
        loading = true;
        if(await WharfService.buyRex(amount)){
            amount = 0;
        }
        loading = false;
    }
</script>

<GlassBox class="mt-2 overflow-hidden">
    <figure class="bg-yellow-400 opacity-90 w-[200px] aspect-[4/4] rounded-full blur-[90px] absolute -top-[180px] -right-[100px] z-0"></figure>
    <section class="flex justify-between relative max-lg:flex-col">
        <section>
            <figure class="text-sm">Minimum lockup</figure>
            <h1 class="text-3xl font-bold -mt-1">21 Days</h1>
        </section>
        <section class="lg:text-right max-lg:mt-4">
            <figure class="text-sm font-black">~APY 🔥</figure>
            <h1 class="text-yellow-300 text-3xl font-black -mt-1 text-shadow">{apy}%</h1>
        </section>
    </section>

    <TokenInput bind:amount={amount}
                balance={$eosBalance}
                suffix="available"
                on:maxed={() => amount = parseFloat($eosBalance.toString())}
                class="mt-8"
    />

    {#if !loading}
        <button class="btn mt-5" on:click={buy}>
            Stake
        </button>
    {:else}
        <button class="btn btn-disabled mt-5" disabled>
            <LoadingSpinner color="#fff" class="w-8 mx-auto" />
        </button>
    {/if}

    <InfoRows class="mt-2" rows={[
        ["You will stake", `${commaNumber(amount)} EOS`, "opacity-70"],
        ["Estimated yield", `${commaNumber(amount*(apy/100))} EOS`, "font-black !text-yellow-300"]
    ]} />

    <InfoBox class="mt-10">
        The APY is an estimate, and may fluctuate based on how many and much others are staking.
        Your 21 day lockup period starts when you unstake your EOS.
        <br />
        <br />
        <u><b>You will never get back less EOS.</b></u>
    </InfoBox>
</GlassBox>
