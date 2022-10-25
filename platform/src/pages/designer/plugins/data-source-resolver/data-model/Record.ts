import type { MeasureValueType, MeasureValueShowType } from './Measure';

export type RecordValueType = MeasureValueType;

export type RecordKey = string;

export type RecordValue = string | number | undefined | null;

export default class Record {
    key: RecordKey;
    value: RecordValue;
    valueType: RecordValueType;
    showType: MeasureValueShowType;

    constructor(key: RecordKey, value: RecordValue, valueType: RecordValueType, showType: MeasureValueShowType) {
        if (!valueType) {
            this.valueType = undefined;
        }

        if (!showType) {
            this.showType = undefined;
        }

        this.key = key;
        this.value = value;
    }

    compare(record: Record): number {
        const source = Number(this.value);
        const target = Number(record);

        if (source > target) {
            return 1;
        }
        if (source === target) {
            return 0;
        }
        return -1
    }

    changeValueType() {

    }

    changeShowType() {

    }

    transform() {

    }

    replace() {

    }

    isUndefined() {

    }

    isEmpty() {

    }

    isNull() {

    }
}