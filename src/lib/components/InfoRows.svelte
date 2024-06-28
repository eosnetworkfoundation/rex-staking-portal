<script lang="ts">

    let clazz:string = "";
    export {clazz as class};

    export let rows:any[];
</script>

<section class="{clazz} ">
    {#each rows as row}
        <section class="row {row[2] || ''}">
            {#each row.slice(0,2) as col,index}
                <div class="col {index === 1 ? 'max-lg:text-xl' : ''}">
                    {col}
                </div>
            {/each}
        </section>
    {/each}
</section>

<style lang="scss">
    .row {
        @apply flex justify-between items-center text-sm text-zinc-300 max-lg:flex-col max-lg:items-start break-words;

        &:not(:last-child) {
            @apply border-b border-white border-opacity-30 pb-1 mb-1;
        }
    }
</style>
