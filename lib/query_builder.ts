import { IteratorType, ModifierType, ResizerType, type Modifier } from './iterator';

export class QueryBuilder<T, K = T> {
	public readonly modifiers: Modifier[] = [];

	public run(items: T[]): K[] {
		let result: unknown[] = [...items];

		for (const modifier of this.modifiers) {
			if (modifier.modifier === ModifierType.Iterator) {
				switch (modifier.type) {
					case IteratorType.Where:
						result = result.filter(modifier.cb);
						break;

					case IteratorType.Select:
						result = result.map(modifier.cb);
						break;
				}
			}

			if (modifier.modifier === ModifierType.Resizer) {
				switch (modifier.type) {
					case ResizerType.Skip:
						result = result.toSpliced(0, modifier.cb());
						break;

					case ResizerType.Take:
						result = result.slice(0, modifier.cb());
						break;
				}
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
