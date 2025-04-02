<script lang="ts">
    let clazz = "";
    export {clazz as class};
</script>

<section class="{clazz} glass-box">
    <slot />
</section>


<style lang="scss">
    .glass-box {
        @apply
            rounded
            text-white
            p-12
            max-lg:p-8;

        background: linear-gradient(142deg, rgba(255, 255, 255, 0.10) 8.16%, rgba(255, 255, 255, 0.02) 78.58%);

        box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25), inset 0px 0px 0px 1px rgba(255, 255, 255, 0.16);
        backdrop-filter: blur(2.800000190734863px);
    }
</style>
