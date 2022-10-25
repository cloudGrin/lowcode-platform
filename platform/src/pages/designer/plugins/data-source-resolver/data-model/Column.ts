import Field, { FieldType } from "./Field";

import type Measure from "./Measure"
import type Dimension from "./Dimension"

export type ColumnItem = Measure | Dimension;
export type ColumnItemType = FieldType

export default class Column  {
    private column: ColumnItem[];

    constructor() {
        this.column = [];
    }

    add(item: ColumnItem) {
        this.column.push(item);
    }

    remove(key: string) {
        const index = this.column.findIndex(item => item.getKey() === key);
        this.column.splice(index, 1);
    }

}