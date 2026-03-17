import { GroupBy, Inverter, Iterator, IteratorType, Resizer, ResizerType, Sorter, type Modifier } from './modifiers';

export class QueryRunner<T, K = T> {
	private runIterator(items: unknown[], iterator: Iterator<unknown, unknown>): unknown[] {
		if (iterator.type === IteratorType.Select) {
			return items.map(iterator.cb);
		}

		if (iterator.type === IteratorType.Where) {
			return items.filter(iterator.cb);
		}

		if (iterator.type === IteratorType.SelectMany) {
			return items.flatMap(iterator.cb);
		}

		return items;
	}

	private runResizer(items: unknown[], resizer: Resizer): unknown[] {
		if (resizer.type === ResizerType.Skip) {
			return items.slice(resizer.cb());
		}

		if (resizer.type === ResizerType.Take) {
			return items.slice(0, resizer.cb());
		}

		return items;
	}

	private runGroupBy(items: unknown[], groupBy: GroupBy<unknown, unknown>): unknown[] {
		const map = new Map<unknown, unknown[]>();
		for (const [idx, item] of items.entries()) {
			const key = groupBy.cb(item, idx, items);
			const bucket = map.get(key) ?? [];
			bucket.push(item);
			map.set(key, bucket);
		}
		return Array.from(map.entries()).map(([key, items]) => ({ key, items }));
	}

	public run(items: T[], modifiers: Modifier[]): K[] {
		let result: unknown[] = [...items];

		for (const modifier of modifiers) {
			if (modifier instanceof Iterator) {
				result = this.runIterator(result, modifier);
			} else if (modifier instanceof Resizer) {
				result = this.runResizer(result, modifier);
			} else if (modifier instanceof Inverter) {
				result = result.toReversed();
			} else if (modifier instanceof Sorter) {
				result = result.toSorted(modifier.cb);
			} else if (modifier instanceof GroupBy) {
				result = this.runGroupBy(result, modifier);
			}
		}

		return result as K[];
	}
}
