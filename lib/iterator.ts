type IteratorCb<T, K> = (i: T, idx: number, arr: T[]) => K;
export enum IteratorType {
	Select = 'select',
	Where = 'where',
}

type SorterCb<T> = (previous: T, current: T) => number;

type ResizerCb = () => number;
export enum ResizerType {
	Skip = 'skip',
	Take = 'take',
}

export enum ModifierType {
	Iterator = 'iterator',
	Sorter = 'sorter',
	Resizer = 'resizer',
	Picker = 'picker',
	Invert = 'invert',
}

export type Iterator<T, K> = {
	modifier: ModifierType.Iterator;
	type: IteratorType;
	cb: IteratorCb<T, K>;
};

export type Sorter<T> = {
	modifier: ModifierType.Sorter;
	cb: SorterCb<T>;
};

export type Resizer = {
	modifier: ModifierType.Resizer;
	type: ResizerType;
	cb: ResizerCb;
};

export type Inverter = { modifier: ModifierType.Invert };

export type Modifier<T = unknown, K = T> = Iterator<T, K> | Sorter<T> | Resizer | Inverter;
