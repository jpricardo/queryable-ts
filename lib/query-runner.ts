import { ModifierType } from './enums/modifier-type';
import type { Modifier } from './modifiers';
import { Iterator, IteratorType } from './modifiers/iterator';
import { Resizer, ResizerType } from './modifiers/resizer';

export class QueryRunner<T, K = T> {
	public readonly modifiers: Modifier[] = [];

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
			return items.toSpliced(0, resizer.cb());
		}

		if (resizer.type === ResizerType.Take) {
			return items.slice(0, resizer.cb());
		}

		return items;
	}

	public run(items: T[]): K[] {
		let result: unknown[] = [...items];

		for (const modifier of this.modifiers) {
			if (modifier.modifier === ModifierType.Iterator) {
				result = this.runIterator(result, modifier);
			}

			if (modifier.modifier === ModifierType.Resizer) {
				result = this.runResizer(result, modifier);
			}

			if (modifier.modifier === ModifierType.Invert) {
				result = result.toReversed();
			}

			if (modifier.modifier === ModifierType.Sorter) {
				result = result.toSorted(modifier.cb);
			}
		}

		return result as K[];
	}
}
