import Field from './Field';

export type MeasureValueType = 'number' | 'float' | 'dicimal'
export type MeasureValueShowType = 'number' | 'float' | 'percent' | 'chainPercentRatio' | 'chainPPRatio';

export default class Measure extends Field {
    fieldKey: string;
    type: MeasureValueType;
    // 展示类型，虽作用于具体物料（如表格）用来进行UI显示的控制，但由于场景较多，在数据层包含
    showType: MeasureValueShowType;
}