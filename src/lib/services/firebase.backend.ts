import { initializeApp, cert, getApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

import {FIREBASE_SERVICE_ACCOUNT, FIRESTORE_DEFAULT_COLLECTION} from "$env/static/private"
if(!FIREBASE_SERVICE_ACCOUNT) {
    throw new Error('Please set your Firebase environment variables');
}

const serviceAccount = JSON.parse(FIREBASE_SERVICE_ACCOUNT!.toString());

let app;
try {
    app = getApp();
} catch (e) {
    app = initializeApp({
        credential: cert(serviceAccount)
    });
}

const db = getFirestore();
const collectionName = (collection:string|null = null) => {
    return collection || FIRESTORE_DEFAULT_COLLECTION || "default";
}

export class FireStore {

    static async get(index: string, collection: string|null = null): Promise<any> {
        try {
            const doc = await db.collection(collectionName(collection)).doc(index).get();
            return doc.data();
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    static async set(index: string, data: any, collection: string|null = null): Promise<boolean> {
        try {
            const write = await db.collection(collectionName(collection)).doc(index).set(data);
            return !!write && !!write.writeTime;
        } catch (error) {
            console.error(error);
            return false;
        }
    }

    static async update(index: string, data: any, collection: string|null = null): Promise<boolean> {
        try {
            const write = await db.collection(collectionName(collection)).doc(index).update(data);
            return !!write && !!write.writeTime;
        } catch (error) {
            console.error(error);
            return false;
        }
    }

    static async setMany(data:Array<{[key:string]:any}>, collection: string|null = null): Promise<boolean> {
        try {
            const batch = db.batch();
            for(const key in data){
                const ref = db.collection(collectionName(collection)).doc(key);
                batch.set(ref, data[key]);
            }
            const write = await batch.commit();
            return !!write && write.length > 0;
        } catch (error) {
            console.error(error);
            return false;
        }
    }

    static async delete(index: string, collection: string|null = null): Promise<boolean> {
        try {
            const write = await db.collection(collectionName(collection)).doc(index).delete();
            return !!write && !!write.writeTime;
        } catch (error) {
            console.error(error);
            return false;
        }
    }

    static async exists(index: string, collection: string|null = null): Promise<boolean> {
        try {
            const doc = await db.collection(collectionName(collection)).doc(index).get();
            return doc.exists;
        } catch (error) {
            console.error(error);
            return false;
        }
    }

    // this doesn't cover OR queries: https://firebase.google.com/docs/firestore/query-data/queries
    static async query(func:(collection:any) => {}, _collection: string|null = null): Promise<any> {
        try {
            const preparedQuery:any = func(db.collection(collectionName(_collection)));
            const query = await preparedQuery.get();
            if(query.empty) return [];

            try {
                return query.docs.map((doc: any) => doc.data());
            } catch(e){}

            try {
                return query.data();
            } catch(e){}

            console.error('Unknown query result');
            return [];
        } catch (error) {
            console.error(error);
            return [];
        }
    }

    static async rawQuery(_collection: string|null = null): Promise<any> {
        return db.collection(collectionName(_collection));
    }
}
