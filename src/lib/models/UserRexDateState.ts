import {Persistent} from "$lib/models/Persistent";

export class UserRexDateState extends Persistent {
    // "account-YYYY-MM-DD"
    public id: string = "";
    // the date in the format of "YYYY-MM-DD"
    public date: string = "";
    public account: string = "";
    public rex: number = 0;

    constructor(json: Partial<UserRexDateState> = {}) {
        super('user_rex_date_state');
        Object.assign(this, json);
    }

    static key(id: string): string {
        return new UserRexDateState({id}).key();
    }
}