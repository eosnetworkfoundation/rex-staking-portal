<script>
    import WharfService, {apr, eosBalance, rexBalance} from "$lib/wharf";
    import TokenInput from "$lib/components/TokenInput.svelte";
    import InfoRows from "$lib/components/InfoRows.svelte";
    import GlassBox from "$lib/components/GlassBox.svelte";
    import {commaNumber, readableNumber} from "$lib";
    import LoadingSpinner from "$lib/components/LoadingSpinner.svelte";
    import InfoBox from "$lib/components/InfoBox.svelte";

    let amount = 0;
    $: rexBalanceAsEos = WharfService.convertRexToEos($rexBalance);
    $: rexUnstaking = WharfService.convertEosToRex(amount);

    // let twentyOneDaysFromNow = new Date();
    // twentyOneDaysFromNow.setDate(twentyOneDaysFromNow.getDate() + 21);

    let loading = false;
    const buy = async () => {
        if(amount <= 0) return;
        if (loading) return;
        loading = true;
        if(await WharfService.unstake(rexUnstaking)){
            amount = 0;
        }
        loading = false;
    }
</script>

<GlassBox class="mt-2 overflow-hidden">

    <TokenInput bind:amount={amount}
                balance={rexBalanceAsEos}
                suffix="staked"
                on:maxed={() => amount = parseFloat(rexBalanceAsEos.toString())}
    />

    {#if !loading}
        <button class="btn mt-5 {amount <= 0 ? 'btn-empty' : ''}" on:click={buy}>
            Unstake
        </button>
    {:else}
        <button class="btn btn-disabled mt-5" disabled>
            <LoadingSpinner color="#fff" class="w-8 mx-auto" />
        </button>
    {/if}

    <InfoRows class="mt-2" rows={[
        // ["Will be available to claim on", `${twentyOneDaysFromNow.toDateString()}`, "opacity-70"],
        ["In 21 days you can claim", `${amount} EOS`, "font-black"]
    ]} />

    <InfoBox class="mt-10">
        Unstaking balances will still accrue rewards until they are claimed. However, any operation
        you do (staking more for instance) will automatically claim your fully unstaked positions.
    </InfoBox>
</GlassBox>
