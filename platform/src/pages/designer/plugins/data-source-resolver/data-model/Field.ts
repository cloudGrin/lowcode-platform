export type FieldType = 'dim' | 'measure' | 'custom';

export default class Field {
    // 字段标识
    protected key: string;
    // 字段名称
    protected title: string;
    // 字段类型
    protected fieldType: FieldType;
    // 指标数值展示的格式，统一采用 http://numeraljs.com/#format 的格式表示法
    protected format?: string;
    protected help?: string;

    constructor(key: string, title: string, fieldType: FieldType, format?: string, help?: string) {
        this.key = key;
        this.title = title;
        this.fieldType = fieldType;
        this.format = format || '';
        this.help = help || ''
    }

    getKey() {
        return this.key;
    }
}
