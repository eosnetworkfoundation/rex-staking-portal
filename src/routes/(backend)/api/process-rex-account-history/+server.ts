import { json } from '@sveltejs/kit';
import {ServerResponse} from "$lib/models/ServerResponse";
import {HistoryBackendService} from "$lib/services/history.backend";

export async function POST({ request }) {
    const { account } = await request.json();
    if(!account || !account.trim().length) return json(ServerResponse.fail('No account provided'));

    const dateKey = (date) => `${account}:${date}`;

    return json(await HistoryBackendService.processAccountHistory(account));
}
