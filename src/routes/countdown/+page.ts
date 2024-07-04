import {redirect} from "@sveltejs/kit";
import {isLive} from "$lib";

export function load({ params }) {

    if(isLive()){
        return redirect(304, '/');
    }
    return {};
}