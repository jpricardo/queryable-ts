import { ModifierType } from '../enums/modifier-type';

type SorterCb<T> = (previous: T, current: T) => number;

export class Sorter<T> {
	public readonly modifier = ModifierType.Sorter;
	constructor(public readonly cb: SorterCb<T>) {}
}
