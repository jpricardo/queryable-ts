import { Inverter } from './inverter';
import { Iterator } from './iterator';
import { Resizer } from './resizer';
import { Sorter } from './sorter';

export type Modifier<T = unknown, K = T> = Iterator<T, K> | Sorter<T> | Resizer | Inverter;

export * from './inverter';
export * from './iterator';
export * from './resizer';
export * from './sorter';
