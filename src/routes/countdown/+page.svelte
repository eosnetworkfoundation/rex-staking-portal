<script lang="ts">
    import CountdownTimer from "$lib/components/CountdownTimer.svelte";
    import BackgroundOverlay from "$lib/components/BackgroundOverlay.svelte";
    import BlurryBg from "$lib/components/BlurryBg.svelte";
    import {onMount} from "svelte";
    import {isLive} from "$lib";
    import {goto} from "$app/navigation";

    onMount(() => {
        if(isLive()){
            goto('/')
        }
    })
</script>

<section class="bg-black w-full min-h-screen relative overflow-x-hidden px-2">
    <BackgroundOverlay />
    <BlurryBg />

    <CountdownTimer />
</section>
