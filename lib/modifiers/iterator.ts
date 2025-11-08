import { ModifierType } from '../enums/modifier-type';

type IteratorCb<T, K> = (i: T, idx: number, arr: T[]) => K;
export enum IteratorType {
	Select = 'select',
	Where = 'where',
}

export class Iterator<T, K> {
	public readonly modifier = ModifierType.Iterator;

	constructor(public readonly type: IteratorType, public readonly cb: IteratorCb<T, K>) {}
}
