
export class AnalyticsService {

    static async pushEvent(event:string, data:any = {}): Promise<boolean> {
        if(!(<any>window).dataLayer) return false;

        (<any>window).dataLayer.push({
            event,
            ...data
        });
    }


}