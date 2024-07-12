<script lang="ts">
    export let Panels: Record<string, string>;
    export let activePanel: string;
</script>

<section class="w-full flex switch">
    {#each Object.values(Panels) as panel}

        {#if panel === Panels.Stats}
            <button class:active={activePanel === panel} style="flex: 0 0 auto;" on:click={() => activePanel = panel}>
                👀
            </button>
        {:else}
            <button class:active={activePanel === panel} on:click={() => activePanel = panel}>
                {panel}
                {#if panel === Panels.Claim}
                    <span class="animate-bounce ml-0.5">🤑</span>
                {/if}
            </button>
        {/if}
    {/each}
</section>

<style lang="scss">
    .switch {
        button {
            position: relative;

            &:first-child {
                @apply
                rounded-tl
                rounded-bl;
            }

            &:not(:first-child) {
                border-left: 0;
            }

            &:last-child {
                @apply
                rounded-tr
                rounded-br;
            }

            @apply
                border-white
                border
                text-white
                px-4
                h-[40px]
                flex
                items-center
                justify-center
                flex-1
                capitalize
                text-sm
                font-bold max-lg:text-xs;

            &.active, &:hover {
                @apply
                bg-white
                text-black;
            }
        }
    }
</style>
