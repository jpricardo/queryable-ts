import { ModifierType } from '../enums/modifier-type';

type GroupByCb<T, K> = (i: T, idx: number, arr: T[]) => K;

export interface IGrouping<TKey, TValue> {
	key: TKey;
	items: TValue[];
}

export class GroupBy<T, K> {
	public readonly modifier = ModifierType.GroupBy;

	constructor(public readonly cb: GroupByCb<T, K>) {}
}
