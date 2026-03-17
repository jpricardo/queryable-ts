import type { Modifier } from './modifiers';
import { Inverter } from './modifiers/inverter';
import { Iterator, IteratorType } from './modifiers/iterator';
import { Resizer, ResizerType } from './modifiers/resizer';
import { Sorter } from './modifiers/sorter';
import { QueryRunner } from './query-runner';

export interface IQueryable<T> {
	// Selectors
	select<K>(cb: Iterator<T, K>['cb']): IQueryable<K>;
	where(cb: Iterator<T, boolean>['cb']): IQueryable<T>;

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

	public sortByAsc(key: keyof T): Queryable<T> {
		const sorter = new Sorter<T>((previous: T, current: T) => {
			const prev = previous[key];
			const curr = current[key];

			if (typeof prev === 'string' && typeof curr === 'string') {
				return prev.localeCompare(curr);
			}

			if (typeof prev === 'number' && typeof curr === 'number') {
				return prev - curr;
			}

			throw new Error(`Invalid key: ${String(key)}`);
		});

		return this.chain(sorter as Sorter<unknown>);
	}

	public sortByDesc(key: keyof T): Queryable<T> {
		const sorter = new Sorter<T>((previous: T, current: T) => {
			const prev = previous[key];
			const curr = current[key];

			if (typeof prev === 'string' && typeof curr === 'string') {
				return curr.localeCompare(prev);
			}

			if (typeof prev === 'number' && typeof curr === 'number') {
				return curr - prev;
			}

			throw new Error(`Invalid key: ${String(key)}`);
		});

		return this.chain(sorter as Sorter<unknown>);
	}

	public sortAsc(): Queryable<T> {
		const sorter = new Sorter<T>((prev, curr) => {
			if (typeof prev === 'string' && typeof curr === 'string') {
				return prev.localeCompare(curr);
			}

			if (typeof prev === 'number' && typeof curr === 'number') {
				return prev - curr;
			}

			throw new Error(`Invalid type`);
		});

		return this.chain(sorter as Sorter<unknown>);
	}

	public sortDesc(): Queryable<T> {
		const sorter = new Sorter<T>((prev, curr) => {
			if (typeof prev === 'string' && typeof curr === 'string') {
				return curr.localeCompare(prev);
			}

			if (typeof prev === 'number' && typeof curr === 'number') {
				return curr - prev;
			}

			throw new Error(`Invalid type`);
		});

		return this.chain(sorter as Sorter<unknown>);
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
	// #endregion
}
