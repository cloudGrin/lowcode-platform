import Field from "./Field";
import Dimension from "./Dimension";
import Column, { ColumnItemType, ColumnItem } from "./Column";
import Row from "./Row";
import Record from "./Record";
import { sort, SortType } from './utils';

type RankOptions = {
  sortType: SortType;
}

export default class TableFrame {
  private column: Column;
  private tableData: Row[];
  originTableData: any;

  constructor() {
    this.column = new Column();
    this.tableData = [];
  }

  columns() {
    return this.column;
  }

  data() {
    return this.tableData;
  }

  setTableData(data) {
    this.tableData = data;
  }

  fromOriginData(originTableData: any) {
    if (!originTableData) {
      this.column = new Column();
      this.tableData = [];
      return this;
    }

    this.originTableData = originTableData;
    this.tableData = originTableData;

  }

  getOriginTableData () {
    return this.originTableData;
  }


  /**
   * 添加列
   *
   * @param item 需要添加的字段
   */
  addColumn(item: ColumnItem) {
    this.column.add(item);
  }

  /**
   * 添加序号列
   *
   * @param newColumnKey 序号列的字段标识
   * @param newColumnName 序号列的字段名称
   * @param start 从哪一个数值开始
   * @param increaseStep 每次增加的步长
   */
  addIndexColumn(newColumnKey: string, newColumnName = '序号', start = 0, increaseStep = 1) {
    const dimension = new Dimension(newColumnKey, newColumnName);
    this.addColumn(dimension);

    this.tableData.forEach((row: Row, index: number) => {
      const value = start + index * increaseStep;
      const record = new Record(newColumnKey, value, 'number', 'number');
      row.add(record);
    });
  }

  /**
   * 添加衍生指标列，衍生指标数据通常由后端返回
   *
   */
  addDerivedColumn() {

  }

  /**
   * 按照某一个列的值的比较，添加排序列，但是不对表格进行进行排序
   *
   */
  addRankColumn(newColumnKey: string, newColumnName = '排序', sortColumnKey: string, options: RankOptions) {
    const dimension = new Dimension(newColumnKey, newColumnName);
    this.addColumn(dimension);

    // 按照指定列，提取改列的值，并进行排序
    const list = this.getColumn(sortColumnKey);
    const sortedList = sort(list, options.sortType);
    const map = {};
    sortedList.forEach((record: Record, rank: number) => {
      map[record.value] = rank;
    });

    this.tableData.forEach((row: Row, index: number) => {
      const sortRecord = row.getRecord(sortColumnKey);
      const rankNumber = map[sortRecord.value];
      const rankRecord = new Record(newColumnKey, rankNumber, 'number', 'number');
      row.add(rankRecord);
    });
  }

  /**
   * 按照指定的列排序
   *
   * @param sortColumnKey
   * @param sortType
   */
  sort(sortColumnKey: string, sortType: SortType) {
    this.tableData = sort(this.tableData, sortType, (row: Row) => row.getRecord(sortColumnKey));
  }

  getColumn(columnKey: string): Record[] {
    return this.tableData.map((row: Row, index: number) => {
      return row.getRecord(columnKey);
    });
  }


  /**
   * 筛选出指定列的所有记录
   *
   * @param columnKey
   * @returns
   */
  selectColumns(columnKeys: string[]): Row[] {
    return this.tableData.map((row: Row, index: number) => {
      columnKeys.forEach(key => {
        newRow[key] = row.getRecord(key);
      });

      let newRow: Row = new Row();
      return newRow;
    });
  }

  /**
   * 删除列
   *
   * @param key
   */
  removeColumn(key: string) {
    this.column.remove(key);
  }

  filterColumn() {

  }

  updateColumn(columnKey: string, columnItem: ColumnItem) {

  }

  updateColumns(columnKeys: string[], columnItems: ColumnItem[]) {

  }

  reorderColumns(columnKeys: string[]) {

  }

  reorderColumnsWithWeightInfo() {

  }

  /**
   * 合并公共元数据到数据列中
   *
   */
  mergeMetaDataToColumn() {

  }


}
