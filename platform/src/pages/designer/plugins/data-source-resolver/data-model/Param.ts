export default class Param {
    private map: any;

    constructor(params: any) {
        this.map = params;
    }

    values() {
        return this.map;
    }

    add(key: string, value: any) {
        this.map[key] = value;
    }

    remove(key: string) {
        delete this.map[key];
    }

    getRecord(key: string) {
        return this.map[key];
    }
}