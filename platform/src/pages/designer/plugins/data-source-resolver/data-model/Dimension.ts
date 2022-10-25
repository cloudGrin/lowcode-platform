import Field from './Field';

export type DimensionOption = {
    label: string,
    value: string | number | boolean
}

export default class Dimension extends Field {
    private options?: DimensionOption[];
    // protected format: string;

    constructor(key: string, title: string) {
        super(key, title, 'dim');
    }
}