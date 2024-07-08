<script lang="ts">
    import { page } from '$app/stores'
    import {onMount} from "svelte";

    const GTAG = 'G-735M0KH4ZY';

    onMount(() => {
        const script = document.createElement('script')
        script.src = `https://www.googletagmanager.com/gtag/js?id=${GTAG}`
        script.async = true;
        script.defer = true;
        document.head.appendChild(script)

        setTimeout(() => {
            const script2 = document.createElement('script')
            script2.innerHTML = `
            window.dataLayer = window.dataLayer || []
            function gtag() {
                dataLayer.push(arguments)
            }
            gtag('js', new Date())
            gtag('config', '${GTAG}')
        `
            document.head.appendChild(script2)
        }, 1000);

    })

    $: {
        if (typeof gtag !== 'undefined') {
            gtag('config', GTAG, {
                page_title: document.title,
                page_path: $page.url.pathname,
            })
        }
    }
</script>
