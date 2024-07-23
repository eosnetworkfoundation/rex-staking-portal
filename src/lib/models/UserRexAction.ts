import {Persistent} from "$lib/models/Persistent";

export enum UserRexActionType {
    Purchase = 0,
    Sell = 1,
}

export class UserRexAction extends Persistent {
    // trx_id
    public id: string = "";
    public block_num: number = 0;
    public date: string = "";
    public account: string = "";
    public rex: number = 0;
    public eos: number = 0;
    public type: UserRexActionType = UserRexActionType.Purchase;

    constructor(json: Partial<UserRexAction> = {}) {
        super('user_rex_action');
        Object.assign(this, json);
    }

    static key(id: string): string {
        return new UserRexAction({id}).key();
    }
}