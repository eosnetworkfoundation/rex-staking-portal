import { json } from '@sveltejs/kit';
import {ServerResponse} from "$lib/models/ServerResponse";
import { dev } from '$app/environment';
import {DatabaseBackend} from "$lib/services/database.backend";
import {HistoryService} from "$lib/services/history";
import {Asset, Int64} from "@wharfkit/antelope";
import {RexDateState} from "$lib/models/RexDateState";

export async function GET({ request }) {
    if(!dev) return json(ServerResponse.fail('Not in dev mode'));

    const getPrice = (pool) => {
        const S0 = parseFloat(pool.total_lendable.split(' ')[0]);
        const R0 = parseFloat(pool.total_rex.split(' ')[0]);
        const R1 = R0 + 1;
        const S1 = (S0 * R1) / R0;
        return parseFloat(parseFloat((S1 - S0).toString()).toFixed(10));
    }

    const getApy = (pool, retpool) => {
        const total_lendable = Asset.fromString(pool.total_lendable).units.toNumber();
        const current_rate_of_increase = Int64.from(retpool.current_rate_of_increase).toNumber();
        const proceeds = Int64.from(retpool.proceeds).toNumber();
        return parseFloat(parseFloat(
            (((proceeds + current_rate_of_increase) / 30 * 365) / total_lendable * 100).toString()
        ).toFixed(2));
    }

    try {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setUTCHours(0, 0, 0, 0);
        const yesterdayTimestamp = +yesterday;

        const dayBeforeYesterday = new Date();
        dayBeforeYesterday.setDate(dayBeforeYesterday.getDate() - 2);
        dayBeforeYesterday.setUTCHours(0, 0, 0, 0);
        const dayBeforeYesterdayTimestamp = +dayBeforeYesterday;

        const rexDateState = new RexDateState({
            id: yesterday.toISOString().split('T')[0],
        });

        const exists = await DatabaseBackend.exists(rexDateState.key());
        if(exists) {
            return json(ServerResponse.ok(true));
        }

        const buyrexBlock = await HistoryService.findBlockForDate(yesterdayTimestamp);
        if(!buyrexBlock) {
            return json(ServerResponse.fail('buyrexBlock not found'));
        }

        let donaterexBlock = await HistoryService.findBlockForDate(yesterdayTimestamp, 'eosio:donatetorex');
        if(!donaterexBlock) {
            // get yesterday's block
            // this is a hack for when there isn't a donation to trigger an update to the rexretpool in this day
            donaterexBlock = await HistoryService.findBlockForDate(dayBeforeYesterdayTimestamp, 'eosio:donatetorex');
            if(!donaterexBlock) {
                return json(ServerResponse.fail('donaterexBlock not found'));
            }
        }

        const rexState = await HistoryService.getBlockRexState(buyrexBlock, donaterexBlock);

        rexDateState.rexPrice = getPrice(rexState.pool);
        rexDateState.apy = getApy(rexState.pool, rexState.retpool);
        rexDateState.tvl = parseFloat(Asset.fromString(rexState.pool.total_lendable).toString().split(' ')[0]);

        await DatabaseBackend.upsert(rexDateState);

        return json(ServerResponse.ok(true));
    } catch (e:any) {
        console.error(e);
        return json(ServerResponse.fail('Failed to get admin data'));
    }
}
