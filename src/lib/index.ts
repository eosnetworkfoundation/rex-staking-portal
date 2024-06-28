import {writable} from "svelte/store";

export let showConfetti = writable(false);

export const readableNumber = (num: number) => {
    // convert to k,m, b, t
    if(num < 1000) return num.toString();
    if(num < 1000000) return (num/1000).toFixed(2) + "K";
    if(num < 1000000000) return (num/1000000).toFixed(2) + "M";
    if(num < 1000000000000) return (num/1000000000).toFixed(2) + "B";
    return (num/1000000000000).toFixed(2) + "T";
}

export const commaNumber = (num: any) => {
    return parseFloat(num).toLocaleString();
}
