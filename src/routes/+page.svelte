<script lang="ts">
    import {onMount} from "svelte";
    import { Confetti } from "svelte-confetti"
    import WharfService, {account, eosBalance} from "$lib/wharf";
    import BackgroundOverlay from "$lib/components/BackgroundOverlay.svelte";
    import PanelSwitcher from "$lib/components/PanelSwitcher.svelte";
    import GetWallet from "$lib/components/GetWallet.svelte";
    import FAQ from "$lib/components/FAQ.svelte";
    import Navbar from "$lib/components/Navbar.svelte";
    import Stake from "$lib/components/Stake.svelte";
    import Unstake from "$lib/components/Unstake.svelte";
    import ClaimRewards from "$lib/components/ClaimRewards.svelte";
    import BlurryBg from "$lib/components/BlurryBg.svelte";
    import {isLive, showConfetti} from "$lib";
    import {goto} from "$app/navigation";
    import { page } from '$app/stores';
    import Stats from "$lib/components/Stats.svelte";

    enum Panels {
        Stake = "stake",
        Unstake = "unstake",
        Claim = "claim",
        Stats = "stats",
    }

    let activePanel: Panels = Panels.Stake;



    onMount(() => {
        if(!$page.url.searchParams.get("forceopen") && !isLive()){
            goto('/countdown')
        }
        WharfService.init();
    })

</script>


<section class="w-full min-h-screen relative overflow-x-hidden px-2">
    <BackgroundOverlay />
    <BlurryBg />

    {#if $showConfetti}
        <section class="fixed top-0 left-0 w-full h-full flex justify-center items-center pointer-events-none">
            <Confetti x={[5,-5]} y={[2.5, -2.5]} amount={200} duration={1000} />
        </section>
    {/if}


    <Navbar />

    <section class="max-w-[600px] mx-auto relative mt-10">

        <PanelSwitcher bind:activePanel={activePanel} {Panels} />

        {#if activePanel === Panels.Stake}
            <Stake />
        {:else if activePanel === Panels.Unstake}
            <Unstake />
        {:else if activePanel === Panels.Claim}
            <ClaimRewards />
        {:else if activePanel === Panels.Stats}
            <Stats />
        {/if}

        <section class="mt-2 text-white flex justify-center items-center text-xs">
            <p>By using this site you are agreeing to the <a href="/terms" target="_blank" class="underline">Terms & Conditions</a>
        </section>


        {#if !$account}
            <GetWallet />
        {/if}

        <FAQ />

    </section>
</section>

<style lang="scss">

</style>
