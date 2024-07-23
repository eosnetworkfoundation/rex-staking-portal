import { json } from '@sveltejs/kit';
import {ServerResponse} from "$lib/models/ServerResponse";
import {COLLECTIONS, DatabaseBackend} from "$lib/services/database.backend";
import {RexDateState} from "$lib/models/RexDateState";
import {HistoryBackendService} from "$lib/services/history.backend";
import {UserRexAction} from "$lib/models/UserRexAction";

export async function POST({ request }) {
    const {account} = await request.json();
    if(!account) return json(ServerResponse.fail('No account provided'));

    try {
        const processed = await HistoryBackendService.processAccountHistory(account);
        if(processed.error) return json(processed);

        const docs = await DatabaseBackend.query(collection => {
            return collection.where('account', '==', account)
        }, UserRexAction, COLLECTIONS.RexActions)

        return json(ServerResponse.ok(docs));
    } catch (e:any) {
        console.error(e);
        return json(ServerResponse.fail('Failed to get account data'));
    }
}
