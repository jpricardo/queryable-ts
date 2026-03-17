import type { GroupBy } from './group-by';
import type { Inverter } from './inverter';
import type { Iterator } from './iterator';
import type { Resizer } from './resizer';
import type { Sorter } from './sorter';

export type Modifier<T = unknown, K = T> = Iterator<T, K> | Sorter<T> | Resizer | Inverter | GroupBy<T, K>;

export * from './group-by';
export * from './inverter';
export * from './iterator';
export * from './resizer';
export * from './sorter';
