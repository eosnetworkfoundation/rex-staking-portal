<script lang="ts">
    import "$lib/app.scss";
    import { Toaster } from 'svelte-sonner'
    import GoogleAnalytics from "$lib/components/analytics/GoogleAnalytics.svelte";
    import {onMount} from "svelte";
    import {AnalyticsService} from "$lib/analytics";

    const title = 'Vaulta Staking'
    const description = 'Stake your Vaulta tokens and earn rewards'
    const url = 'https://stake.eosnetwork.com'

    // onMount(() => {
    //     // return false;
    //     setTimeout(() => {
    //         AnalyticsService.pushEvent('staked', {
    //             eos: 1337,
    //             account: 'testaccount'
    //         })
    //
    //         AnalyticsService.pushEvent('unstaked', {
    //             eos: 7331,
    //             rex: 1337,
    //             account: 'testaccount'
    //         })
    //
    //         AnalyticsService.pushEvent('claimed', {
    //             eos: 1234,
    //             rex: 4321,
    //             account: 'testaccount'
    //         })
    //     }, 1000)
    // })

</script>

<svelte:head>
    <title>{title}</title>
    <meta name="description" content={description} />
    <meta property="og:image" content="{url}/ogimage.png">
    <meta property="og:locale" content="en" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:type" content="website" />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:url" content={url} />
    <meta property="og:site_name" content={title} />
</svelte:head>

<GoogleAnalytics />

<Toaster />

<figure class="bg-black fixed top-0 left-0 w-full h-full z-0" style="height:100vh;">
    <img style="object-fit: cover; height:100%; min-height: 100%; width:100%;" src="/images/bg.webp" alt="EOS Staking" />
    <!-- bottom gradient to black -->
    <div class="absolute bottom-0 left-0 w-full h-full bg-gradient-to-t from-black to-transparent"></div>
</figure>

<slot />
