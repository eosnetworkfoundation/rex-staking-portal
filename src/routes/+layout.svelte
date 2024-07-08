<script lang="ts">
    import "$lib/app.scss";
    import { Toaster } from 'svelte-sonner'
    import GoogleAnalytics from "$lib/components/analytics/GoogleAnalytics.svelte";

    const title = 'EOS Staking'
    const description = 'Stake your EOS tokens and earn rewards'
    const url = 'https://stake.eosnetwork.com'
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

<slot />
