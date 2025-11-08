import type { Inverter } from './inverter';
import type { Iterator } from './iterator';
import type { Resizer } from './resizer';
import type { Sorter } from './sorter';

export type Modifier<T = unknown, K = T> = Iterator<T, K> | Sorter<T> | Resizer | Inverter;
