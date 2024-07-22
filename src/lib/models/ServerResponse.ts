export class ServerResponse {
    public data:any = null;
    public error:boolean = false;

    constructor(json?:Partial<ServerResponse>){
        (<any>Object).assign(this, json);
    }

    static ok(data: any): ServerResponse {
        return new ServerResponse({
            error: false,
            data,
        });
    }

    static fail(data: any): ServerResponse {
        return new ServerResponse({
            error: true,
            data,
        });
    }

}