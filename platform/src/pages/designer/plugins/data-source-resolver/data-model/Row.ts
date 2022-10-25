import Record, { RecordKey, RecordValue } from './Record'

type RecordMap = {
    [key: RecordKey]: Record;
}

export default class Row {
    private recordMap: RecordMap;

    constructor(recordMap = {} as RecordMap) {
        this.recordMap = recordMap;
    }

    add(record: Record) {
        this.recordMap[record.key] = record;
    }

    remove(recordKey: RecordKey) {
        delete this.recordMap[recordKey];
    }

    getRecord(key: RecordKey) {
        return this.recordMap[key];
    }
}