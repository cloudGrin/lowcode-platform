import Record from './Record';

export type SortType = 'desc' | 'asc';

type GetSourtItem<T> = (item: T) => Record;

const defaultGetSourtItem: GetSourtItem<Record> = (item: Record) => item;

export function sort<T>(list: T[], type: SortType, fn = defaultGetSourtItem as unknown as  GetSourtItem<T>): T[] {
    if (!type) {
        type = 'asc';
    }
    if (!fn) {
        fn = defaultGetSourtItem as unknown as GetSourtItem<T>;
    }

    const newList = list.sort((a, b) => {
        const newA = fn(a);
        const newB = fn(b);

        let res = newA.compare(newB);
        if (type === 'desc') {
            return -res;
        }
        return res;
    });

    return newList;
}