import {Persistent} from "$lib/models/Persistent";

export class RexDateState extends Persistent {
    // the date in the format of "YYYY-MM-DD"
    public id: string = "";
    public rexPrice: number = 0;
    public apy: number = 0;
    public tvl: number = 0;

    constructor(json: Partial<RexDateState> = {}) {
        super('rex_date_state');
        Object.assign(this, json);
    }

    static key(id: string): string {
        return new RexDateState({id}).key();
    }
}