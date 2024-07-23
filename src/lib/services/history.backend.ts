import {HistoryService} from "$lib/services/history";
import {COLLECTIONS, DatabaseBackend} from "$lib/services/database.backend";
import {UserRexAction, UserRexActionType} from "$lib/models/UserRexAction";
import {ServerResponse} from "$lib/models/ServerResponse";

export class HistoryBackendService {

    static async processAccountHistory(account:string){
        try {
            const earliestDate = '2024-07-07';
            const earliestTimestamp = +new Date(earliestDate);

            const purchases = await HistoryService.getPurchases(account);

            for(let purchase of purchases) {
                if(await DatabaseBackend.exists(UserRexAction.key(purchase.trx_id), COLLECTIONS.RexActions)) {
                    continue;
                }

                const price = await HistoryService.getPriceForBlock(purchase.block_num);
                const rex = parseFloat((purchase.amount / price).toString()).toFixed(4);
                const action = new UserRexAction({
                    id: purchase.trx_id,
                    block_num: purchase.block_num,
                    date: purchase.timestamp,
                    account,
                    rex: parseFloat(rex),
                    eos: purchase.amount,
                    type: UserRexActionType.Purchase,
                });

                await DatabaseBackend.upsert(action, COLLECTIONS.RexActions);
            }

            const sells = await HistoryService.getSells(account);
            for(let sell of sells) {
                if(await DatabaseBackend.exists(UserRexAction.key(sell.trx_id), COLLECTIONS.RexActions)) {
                    continue;
                }

                const price = await HistoryService.getPriceForBlock(sell.block_num);
                const eos = parseFloat((sell.amount * price).toString()).toFixed(4);
                const action = new UserRexAction({
                    id: sell.trx_id,
                    block_num: sell.block_num,
                    date: sell.timestamp,
                    account,
                    rex: sell.amount,
                    eos: parseFloat(eos),
                    type: UserRexActionType.Sell,
                });

                await DatabaseBackend.upsert(action, COLLECTIONS.RexActions);
            }

            return ServerResponse.ok({});
        } catch (e:any) {
            console.error(e);
            return ServerResponse.fail('Failed to get process account history');
        }
    }

}