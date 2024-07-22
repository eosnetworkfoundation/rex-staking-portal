import { json } from '@sveltejs/kit';
import {ServerResponse} from "$lib/models/ServerResponse";
import { dev } from '$app/environment';
import {DatabaseBackend} from "$lib/services/database.backend";
import {HistoryService} from "$lib/services/history";
import {Asset, Int64} from "@wharfkit/antelope";
import {RexDateState} from "$lib/models/RexDateState";
import {UserRexDateState} from "$lib/models/UserRexDateState";

export async function POST({ request }) {
    // if(!dev) return json(ServerResponse.fail('Not in dev mode'));

    const { account } = await request.json();
    if(!account || !account.trim().length) return json(ServerResponse.fail('No account provided'));

    const dateKey = (date) => `${account}:${date}`;

    try {
        const earliestDate = '2024-07-07';
        const earliestTimestamp = +new Date(earliestDate);
        const currentDate = new Date().toISOString().split('T')[0];
        const daysBetween = Math.abs(Math.floor((Date.parse(earliestDate) - Date.parse(currentDate)) / 86400000));

        for(let i = 0; i < daysBetween; i++){
            const date = new Date(earliestTimestamp + (i * 86400000)).toISOString().split('T')[0];
            console.log('Processing:', date);

            const rexDateState = new UserRexDateState({
                id: dateKey(date),
            });

            const exists = await DatabaseBackend.exists(rexDateState.key());
            if(exists) {
                console.log('exists', date);
                continue;
            }

            const buyrexBlock = await HistoryService.findBlockForDate(earliestTimestamp + (i * 86400000));
            if(!buyrexBlock) {
                console.error('buyrexBlock not found', i);
                continue;
            }

            let donaterexBlock = await HistoryService.findBlockForDate(earliestTimestamp + (i * 86400000), 'eosio:donatetorex');
            if(!donaterexBlock) {
                // get yesterday's block
                // this is a hack for when there isn't a donation to trigger an update to the rexretpool in this day
                donaterexBlock = await HistoryService.findBlockForDate(earliestTimestamp + ((i - 1) * 86400000), 'eosio:donatetorex');
                if(!donaterexBlock) {
                    console.error('donaterexBlock not found', i);
                    continue;
                }
            }

            const rexState = await HistoryService.getBlockRexState(buyrexBlock, donaterexBlock);

            rexDateState.rexPrice = getPrice(rexState.pool);
            rexDateState.apy = getApy(rexState.pool, rexState.retpool);
            rexDateState.tvl = parseFloat(Asset.fromString(rexState.pool.total_lendable).toString().split(' ')[0]);

            await DatabaseBackend.upsert(rexDateState);

        }


        return json(ServerResponse.ok({}));
    } catch (e:any) {
        console.error(e);
        return json(ServerResponse.fail('Failed to get admin data'));
    }
}
