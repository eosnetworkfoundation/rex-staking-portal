export class Api {
    static async get(path:string) {
        const response = await fetch(path);
        return await response.json();
    }
    static async post(path:string, data:any = {}) {
        const response = await fetch(path, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        return await response.json();
    }
    static async put(path:string, data:any = {}) {
        const response = await fetch(path, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        return await response.json();
    }
    static async delete(path:string) {
        const response = await fetch(path, {
            method: 'DELETE'
        });
        return await response.json();
    }
    static async patch(path:string, data:any = {}) {
        const response = await fetch(path, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        return await response.json();
    }
}