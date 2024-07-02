<script lang="ts">
    import { slide } from "svelte/transition";

    let faq = [
        {
            question: 'How is the yield calculated?',
            answer:`
                Yield is calculated using a simple formula:
                <br />
                <br />
                <span class="text-black bg-yellow-400 px-2 py-1 rounded">annual reward / total staked</span>
                <br />
                <br />
                However, keep in mind that the rate will continuously change as more people stake or unstake their EOS.
            `
        },
        {
            question: 'Where does the yield come from?',
            answer:`
                The EOS Network has a pre-allocated 250,000,000 EOS staking reward pool that gets released on a halving schedule every
                4 years.
                <br />
                <br />
                For instance, the first period will have 125,000,000 EOS spread across 4 years (31,250,000 EOS per year).
            `,
        },
        {
            question: 'How long do I need to be staked for?',
            answer:`
                The staking period has a <u>minimum</u> of 21 days.
                <br />
                <br />
                However, until you manually unstake you will be staked indefinitely.
                <br />
                <br />
                Once you trigger unstaking, you will then have to wait for 21 days before you can claim your rewards.
            `,
        },
        {
            question: 'Why was my matured position automatically sold?',
            answer:`
                After you unstake and wait the 21 days, your position will automatically be sold when you do any action (like staking or unstaking).
                You will still need to claim those rewards, but your will not continue to produce yield on the matured position.
            `,
        },
        {
            question: 'Can I immediately unstake and get my EOS back?',
            answer:`
                No, you must wait 21 days once you unstake.
            `,
        },
        // {
        //     question: `Why can't I claim all of my rewards at once?`,
        //     answer: `
        //     `,
        // },
        {
            question: `Does my unstaking EOS still produce yield?`,
            answer: `Yes!
            Your EOS will continue to produce yield until the end of the staking period,
            until it is claimed or auto-claimed by doing another action like staking or unstaking.`,
        },
        {
            question: `I didn't get exactly the amount of EOS I was expecting. Why?`,
            answer: `
            When you stake EOS you get another token in return (REX).
            In order to make this interface as simple as possible all of the conversions to and from that token are handled for you.
            However, this sometimes means tiny differences in the amount of EOS you unstake.`
        }
    ]

    let open:number = -1;
    const toggle = (index:number) => {
        open = open === index ? -1 : index;
    }
</script>

<section class="my-10 w-full text-white">

    {#each faq as item,index}
        <section class="[&:not(:last-child)]:border-b border-zinc-700">

            <button class="w-full flex justify-between items-center cursor-pointer py-2" on:click={() => toggle(index)}>
                <span class="text-lg flex-1 text-left {open === index ? 'text-yellow-400' : ''}">
                    {item.question}
                </span>
                <span class="{open === index ? 'transform rotate-180' : ''} transition-transform duration-300">
                    <svg width="17" height="11" viewBox="0 0 17 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="2.12134" y="0.0751953" width="12" height="3" transform="rotate(45 2.12134 0.0751953)" fill="white"/>
                        <rect x="6.29291" y="8.48529" width="12" height="3" transform="rotate(-45 6.29291 8.48529)" fill="white"/>
                    </svg>
                </span>
            </button>

            {#if open === index}
                <section class="pt-3 pb-12" transition:slide={{duration: 200}}>
                    <p class="text-sm">
                        {@html item.answer}
                    </p>
                </section>
            {/if}
        </section>
    {/each}

</section>
