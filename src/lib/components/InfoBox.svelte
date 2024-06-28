<script lang="ts">
    let clazz:string = '';
    export {clazz as class};
</script>

<figure class="{clazz} text-white text-xs text-opacity-50 italic border border-white border-opacity-50 p-3 rounded">
    <slot />
</figure>