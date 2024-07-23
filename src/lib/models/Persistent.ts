import { v4 } from 'uuid';

export class Persistent {
    public id:string;
    public docType:string;
    public createdAt:number;
    public updatedAt:number|null = null;

    constructor(docType:string){
        this.id = v4();
        this.docType = docType;
        this.createdAt = +new Date();
    }

    key():string{
        return `${this.docType}::${this.id}`;
    }
}
