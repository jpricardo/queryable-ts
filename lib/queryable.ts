import {
	IteratorType,
	ModifierType,
	ResizerType,
	type Iterator,
	type Modifier,
	type Resizer,
	type Sorter,
} from './iterator';
import { QueryBuilder } from './query_builder';

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
	constructor(private readonly items: T[]) {}

	private readonly builder = new QueryBuilder<T>();

	private addModifier(modifier: Modifier) {
		this.builder.modifiers.push(modifier);
	}

	private run() {
		return this.builder.run(this.items);
	}

	// #region Selectors
	public select<K>(cb: Iterator<T, K>['cb']): Queryable<K> {
		const iterator: Iterator<T, K> = {
			modifier: ModifierType.Iterator,
			type: IteratorType.Select,
			cb,
		};

		this.addModifier(iterator as Modifier);

		return this as unknown as Queryable<K>;
	}

	public where(cb: Iterator<T, boolean>['cb']): Queryable<T> {
		const iterator: Iterator<T, boolean> = {
			modifier: ModifierType.Iterator,
			type: IteratorType.Where,
			cb,
		};

		this.addModifier(iterator as Modifier);

		return this;
	}
	// #endregion

	// #region Resizers
	public skip(amount: number): Queryable<T> {
		const resizer: Resizer = {
			modifier: ModifierType.Resizer,
			type: ResizerType.Skip,
			cb: () => amount,
		};

		this.addModifier(resizer);

		return this;
	}

	public take(amount: number): Queryable<T> {
		const resizer: Resizer = {
			modifier: ModifierType.Resizer,
			type: ResizerType.Take,
			cb: () => amount,
		};

		this.addModifier(resizer);

		return this;
	}
	// #endregion

	// #region Sorters
	public reverse(): Queryable<T> {
		this.addModifier({ modifier: ModifierType.Invert });

		return this;
	}

	public sort(cb: Sorter<T>['cb']): Queryable<T> {
		const sorter: Sorter<T> = { modifier: ModifierType.Sorter, cb };

		this.addModifier(sorter as Sorter<unknown>);

		return this;
	}

	public sortByAsc(key: keyof T): Queryable<T> {
		const sorter: Sorter<T> = {
			modifier: ModifierType.Sorter,
			cb: (previous: T, current: T) => {
				const prev = previous[key];
				const curr = current[key];

				if (typeof prev === 'string' && typeof curr === 'string') {
					return prev.localeCompare(curr);
				}

				if (typeof prev === 'number' && typeof curr === 'number') {
					return prev - curr;
				}

				throw new Error(`Invalid key: ${String(key)}`);
			},
		};

		this.addModifier(sorter as Sorter<unknown>);

		return this;
	}

	public sortByDesc(key: keyof T): Queryable<T> {
		const sorter: Sorter<T> = {
			modifier: ModifierType.Sorter,
			cb: (previous: T, current: T) => {
				const prev = previous[key];
				const curr = current[key];

				if (typeof prev === 'string' && typeof curr === 'string') {
					return curr.localeCompare(prev);
				}

				if (typeof prev === 'number' && typeof curr === 'number') {
					return curr - prev;
				}

				throw new Error(`Invalid key: ${String(key)}`);
			},
		};

		this.addModifier(sorter as Sorter<unknown>);

		return this;
	}

	public sortAsc(): Queryable<T> {
		const sorter: Sorter<T> = {
			modifier: ModifierType.Sorter,
			cb: (prev: T, curr: T) => {
				if (typeof prev === 'string' && typeof curr === 'string') {
					return prev.localeCompare(curr);
				}

				if (typeof prev === 'number' && typeof curr === 'number') {
					return prev - curr;
				}

				throw new Error(`Invalid type`);
			},
		};

		this.addModifier(sorter as Sorter<unknown>);

		return this;
	}

	public sortDesc(): Queryable<T> {
		const sorter: Sorter<T> = {
			modifier: ModifierType.Sorter,
			cb: (prev: T, curr: T) => {
				if (typeof prev === 'string' && typeof curr === 'string') {
					return curr.localeCompare(prev);
				}

				if (typeof prev === 'number' && typeof curr === 'number') {
					return curr - prev;
				}

				throw new Error(`Invalid type`);
			},
		};

		this.addModifier(sorter as Sorter<unknown>);

		return this;
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
