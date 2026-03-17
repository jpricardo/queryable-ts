import type { Modifier } from './modifiers';
import { Inverter, Iterator, IteratorType, Resizer, ResizerType, Sorter } from './modifiers';

export class QueryRunner<T, K = T> {
	private runIterator(items: unknown[], iterator: Iterator<unknown, unknown>): unknown[] {
		if (iterator.type === IteratorType.Select) {
			return items.map(iterator.cb);
		}

		if (iterator.type === IteratorType.Where) {
			return items.filter(iterator.cb);
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
			}
		}

		return result as K[];
	}
}
