import {
	GroupBy,
	Inverter,
	Iterator,
	IteratorType,
	Resizer,
	ResizerType,
	Sorter,
	type IGrouping,
	type Modifier,
} from './modifiers';
import { QueryRunner } from './query-runner';

export interface IQueryable<T> {
	// Selectors
	select<K>(cb: Iterator<T, K>['cb']): IQueryable<K>;
	where(cb: Iterator<T, boolean>['cb']): IQueryable<T>;
	selectMany<K>(cb: Iterator<T, K[]>['cb']): IQueryable<K>;
	distinct<K>(...[cb]: T extends string | number | boolean ? [] : [Iterator<T, K>['cb']]): IQueryable<T>;

	// Resizers
	skip(amount: number): IQueryable<T>;
	take(amount: number): IQueryable<T>;

	// Sorters
	reverse(): IQueryable<T>;
	sort(cb: Sorter<T>['cb']): IQueryable<T>;
	sortByAsc(key: keyof T): IQueryable<T>;
	sortByDesc(key: keyof T): IQueryable<T>;
	sortAsc(): IQueryable<T>;
	sortDesc(): IQueryable<T>;

	// Pickers
	first(cb?: Iterator<T, boolean>['cb']): T | undefined;
	last(cb?: Iterator<T, boolean>['cb']): T | undefined;
	sum(...[cb]: T extends number ? [] : [Iterator<T, number>['cb']]): number;
	count(): number;
	all(): T[];

	// Grouping
	groupBy<K>(cb: Iterator<T, K>['cb']): IQueryable<IGrouping<K, T>>;
}

export class Queryable<T = unknown> implements IQueryable<T> {
	constructor(private readonly items: T[], private readonly modifiers: Modifier[] = []) {}

	private chain(modifier: Modifier): Queryable<T> {
		return new Queryable<T>(this.items, [...this.modifiers, modifier]);
	}

	private chainAs<K>(modifier: Modifier): Queryable<K> {
		return new Queryable<K>(this.items as unknown as K[], [...this.modifiers, modifier]);
	}

	private run(): T[] {
		return new QueryRunner<T>().run(this.items, this.modifiers);
	}

	// #region Selectors
	public select<K>(cb: Iterator<T, K>['cb']): Queryable<K> {
		return this.chainAs<K>(new Iterator(IteratorType.Select, cb) as Modifier);
	}

	public where(cb: Iterator<T, boolean>['cb']): Queryable<T> {
		return this.chain(new Iterator(IteratorType.Where, cb) as Modifier);
	}

	public selectMany<K>(cb: Iterator<T, K[]>['cb']): Queryable<K> {
		return this.chainAs<K>(new Iterator(IteratorType.SelectMany, cb) as Modifier);
	}

	public distinct<K>(...[cb]: T extends string | number | boolean ? [] : [Iterator<T, K>['cb']]): Queryable<T> {
		const all = this.all();
		const seen = new Set<unknown>();
		const result = all.filter((item, idx, arr) => {
			const key = cb ? cb(item, idx, arr) : item;
			if (seen.has(key)) return false;
			seen.add(key);
			return true;
		});
		return new Queryable<T>(result);
	}
	// #endregion

	// #region Resizers
	public skip(amount: number): Queryable<T> {
		return this.chain(new Resizer(ResizerType.Skip, () => amount));
	}

	public take(amount: number): Queryable<T> {
		return this.chain(new Resizer(ResizerType.Take, () => amount));
	}
	// #endregion

	// #region Sorters
	public reverse(): Queryable<T> {
		return this.chain(new Inverter());
	}

	public sort(cb: Sorter<T>['cb']): Queryable<T> {
		return this.chain(new Sorter(cb) as Modifier);
	}

	private makeSorter(direction: 'asc' | 'desc', key?: keyof T): Sorter<T> {
		return new Sorter<T>((previous: T, current: T) => {
			const prev = key ? previous[key] : previous;
			const curr = key ? current[key] : current;

			let result: number;

			if (typeof prev === 'string' && typeof curr === 'string') {
				result = prev.localeCompare(curr);
			} else if (typeof prev === 'number' && typeof curr === 'number') {
				result = prev - curr;
			} else {
				throw new Error(key ? `Invalid key: ${String(key)}` : `Invalid type`);
			}

			return direction === 'asc' ? result : -result;
		});
	}

	public sortByAsc(key: keyof T): Queryable<T> {
		return this.chain(this.makeSorter('asc', key) as Sorter<unknown>);
	}

	public sortByDesc(key: keyof T): Queryable<T> {
		return this.chain(this.makeSorter('desc', key) as Sorter<unknown>);
	}

	public sortAsc(): Queryable<T> {
		return this.chain(this.makeSorter('asc') as Sorter<unknown>);
	}

	public sortDesc(): Queryable<T> {
		return this.chain(this.makeSorter('desc') as Sorter<unknown>);
	}
	// #endregion

	// #region Pickers
	public sum(...[cb]: T extends number ? [] : [Iterator<T, number>['cb']]): number {
		return this.all().reduce((prev, curr, idx, arr) => (cb ? cb(curr, idx, arr) : (curr as number)) + prev, 0);
	}

	public count(): number {
		return this.all().length;
	}

	public first(cb?: Iterator<T, boolean>['cb']): T | undefined {
		const all = this.all();
		return cb ? all.find(cb) : all.at(0);
	}

	public last(cb?: Iterator<T, boolean>['cb']): T | undefined {
		const all = this.all();
		return cb ? all.findLast(cb) : all.at(-1);
	}

	public all(): T[] {
		return this.run();
	}

	public groupBy<K>(cb: Iterator<T, K>['cb']): Queryable<IGrouping<K, T>> {
		return this.chainAs<IGrouping<K, T>>(new GroupBy(cb) as Modifier);
	}
	// #endregion
}
