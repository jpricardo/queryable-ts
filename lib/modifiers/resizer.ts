import { ModifierType } from '../enums/modifier-type';

type ResizerCb = () => number;
export enum ResizerType {
	Skip = 'skip',
	Take = 'take',
}

export class Resizer {
	public readonly modifier = ModifierType.Resizer;

	constructor(public readonly type: ResizerType, public readonly cb: ResizerCb) {}
}
