<script lang="ts">
    import CountdownTimer from "$lib/components/CountdownTimer.svelte";
    import BackgroundOverlay from "$lib/components/BackgroundOverlay.svelte";
    import BlurryBg from "$lib/components/BlurryBg.svelte";
</script>

<section class="bg-black w-full min-h-screen relative overflow-x-hidden px-2">
    <BackgroundOverlay />
    <BlurryBg />

    <CountdownTimer />
</section>