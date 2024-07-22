import { json } from '@sveltejs/kit';
import {ServerResponse} from "$lib/models/ServerResponse";
import {DatabaseBackend} from "$lib/services/database.backend";
import {RexDateState} from "$lib/models/RexDateState";

export async function GET({ request }) {

    try {
        const earliestDate = '2024-07-07';

        const docs = await DatabaseBackend.query(collection => {
            return collection.where('docType', '==', 'rex_date_state')
        }, RexDateState)

        return json(ServerResponse.ok(docs));
    } catch (e:any) {
        console.error(e);
        return json(ServerResponse.fail('Failed to get admin data'));
    }
}
