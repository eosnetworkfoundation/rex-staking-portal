<script lang="ts">
    import {createEventDispatcher} from "svelte";
    import EOS from "$lib/svgs/EOS.svelte";

    const dispatch = createEventDispatcher();

    let clazz:string = "";
    export {clazz as class};

    export let amount = 0;
    export let balance:any = '';
    export let suffix = '';
</script>

<section class="{clazz} token-input rounded-lg flex items-center">
    <section class="px-4 mr-2">
        <EOS />
    </section>

    <input class="w-full text-2xl outline-0 bg-transparent" type="number" bind:value={amount} />

    <button class="ml-2 px-3 h-[40px] text-sm border border-white text-white rounded hover:bg-white hover:text-black" on:click={() => dispatch('maxed')}>
        MAX
    </button>

</section>
<figure class="text-sm text-white w-full text-right mt-1">
    You have {balance} EOS {suffix}
</figure>

<style lang="scss">
    .token-input {
        @apply
            p-3;
        border: 2px solid rgba(255, 255, 255, 0.31);
        background: rgba(0, 0, 0, 0.75);
        backdrop-filter: blur(6.800000190734863px);

        transition: border-color 0.2s;

        &:has(input:focus) {
            @apply border-yellow-400;
        }
    }
</style>
