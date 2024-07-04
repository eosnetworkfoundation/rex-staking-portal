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
    if(isNaN(num) || num === null || num === undefined) return 0;
    return parseFloat(num).toLocaleString();
}

export const liveDate = +new Date("2024-07-08T00:00:00.000");
export const isLive = () => liveDate < +new Date();
