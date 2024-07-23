import { FireStore } from "$lib/services/firebase.backend";

export enum COLLECTIONS {
    RexActions  = 'rex_actions',
}

export class DatabaseBackend {
    static async insert(model:any, collection:string|null = null):Promise<boolean> {
        model.updatedAt = Date.now();
        if(await FireStore.exists(model.key(), collection)) throw new Error('Document already exists');
        return FireStore.set(model.key(), JSON.parse(JSON.stringify(model)), collection);
    }
    static async upsert(model:any, collection:string|null = null){
        model.updatedAt = Date.now();
        return FireStore.set(model.key(), JSON.parse(JSON.stringify(model)), collection);
    }

    static async upsertMany(models:any[], collection:string|null = null){
        const data:any = {};
        for(const model of models.filter(x => !!x)){
            model.updatedAt = Date.now();
            data[model.key()] = JSON.parse(JSON.stringify(model));
        }
        return FireStore.setMany(data, collection);
    }

    static async upsertRaw(key:any, data:any, collection:string|null = null){
        if(data.hasOwnProperty('updatedAt')) data.updatedAt = Date.now();
        return FireStore.set(key, typeof data === 'string' ? JSON.parse(JSON.stringify(data)) : data, collection);
    }

    static async get(key:string, Model:any = null, collection:string|null = null): Promise<any|null> {
        return FireStore.get(key, collection).then(x => {
            if(!x) return null;
            return Model ? new Model(x) : x;
        });
    }

    static async update(key:string, data:any, collection:string|null = null): Promise<boolean> {
        if(data.hasOwnProperty('updatedAt')) data.updatedAt = Date.now();
        return FireStore.update(key, data, collection);
    }

    static async remove(key:any, collection:string|null = null){
        return FireStore.delete(key, collection);
    }

    static async exists(key:any, collection:string|null = null){
        return FireStore.exists(key, collection);
    }

    static async query(func:(collection:any) => {}, Model:any = null, _collection:string|null = null){
        return FireStore.query(func, _collection).then(x => Model ? x.map((y:any) => new Model(y)) : x);
    }

    static async rawQuery(_collection:string|null = null){
        return FireStore.rawQuery(_collection);
    }
}