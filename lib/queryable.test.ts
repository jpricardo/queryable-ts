import { Queryable } from './queryable';

const largeSetSize = 1_000_000;
function getLargeSet() {
	const result = [];

	for (let i = 1; i <= largeSetSize; i++) {
		result.push(i);
	}

	return result;
}

let largeSet: number[];

beforeAll(() => {
	largeSet = getLargeSet();
});

describe('Queryable', () => {
	it('should combine skip, take and transformers', () => {
		const result = new Queryable([1, 2, 3, 4])
			.where((i) => i > 1)
			.skip(2)
			.select((i) => i ** i)
			.take(1)
			.all();
		expect(result).toEqual([256]);
	});

	it('should handle an empty set', () => {
		const result = new Queryable([])
			.where((i) => i > 1)
			.skip(2)
			.select((i) => i ** i)
			.take(1)
			.all();
		expect(result).toEqual([]);
	});

	it('should handle a large set', () => {
		const result = new Queryable(largeSet)
			.select((i) => i ** 2)
			.skip(500)
			.where((i) => i === largeSetSize)
			.take(1)
			.all();
		expect(result).toEqual([largeSetSize]);
	});
});

// #region Iterators
describe('Queryable.select', () => {
	it('should run', () => {
		const result = new Queryable([1, 2, 3, 4]).select((i) => i.toString()).all();
		expect(result).toEqual(['1', '2', '3', '4']);
	});

	it('should handle an empty set', () => {
		const result = new Queryable<number>([]).select((i) => i.toString()).all();
		expect(result).toEqual([]);
	});

	it('should handle a large set', () => {
		const result = new Queryable(largeSet).select((i) => i).all();
		expect(result).toEqual(largeSet);
	});
});

describe('Queryable.where', () => {
	it('should run', () => {
		const result = new Queryable([1, 2, 3, 4]).where((i) => i > 2).all();
		expect(result).toEqual([3, 4]);
	});

	it('should handle an empty set', () => {
		const result = new Queryable([]).all();
		expect(result).toEqual([]);
	});

	it('should handle a large set', () => {
		const result = new Queryable(largeSet).where(() => false).all();
		expect(result).toEqual([]);
	});
});

describe('Queryable.selectMany', () => {
	it('should flatten a nested array', () => {
		const result = new Queryable([1, 2, 3]).selectMany((i) => [i, i * 10]).all();
		expect(result).toEqual([1, 10, 2, 20, 3, 30]);
	});

	it('should be chainable', () => {
		const result = new Queryable([{ tags: ['a', 'b'] }, { tags: ['c'] }])
			.selectMany((i) => i.tags)
			.where((i) => i !== 'b')
			.all();
		expect(result).toEqual(['a', 'c']);
	});

	it('should expose index and array in callback', () => {
		const result = new Queryable([10, 20, 30]).selectMany((i, idx) => [i, idx]).all();
		expect(result).toEqual([10, 0, 20, 1, 30, 2]);
	});

	it('should handle an empty set', () => {
		const result = new Queryable<number[]>([]).selectMany((i) => i).all();
		expect(result).toEqual([]);
	});

	it('should handle a large set', () => {
		const result = new Queryable(largeSet).selectMany((i) => [i]).count();
		expect(result).toEqual(largeSetSize);
	});
});

describe('Queryable.distinct', () => {
	it('should deduplicate primitives', () => {
		const result = new Queryable([1, 2, 2, 3, 3, 3]).distinct().all();
		expect(result).toEqual([1, 2, 3]);
	});

	it('should deduplicate strings', () => {
		const result = new Queryable(['a', 'b', 'a', 'c']).distinct().all();
		expect(result).toEqual(['a', 'b', 'c']);
	});

	it('should deduplicate objects by key selector', () => {
		const result = new Queryable([
			{ id: 1, name: 'Alice' },
			{ id: 2, name: 'Bob' },
			{ id: 1, name: 'Alice (dupe)' },
		])
			.distinct((i) => i.id)
			.all();
		expect(result).toEqual([
			{ id: 1, name: 'Alice' },
			{ id: 2, name: 'Bob' },
		]);
	});

	it('should expose index and array in callback', () => {
		const seen: number[] = [];
		new Queryable([{ id: 1 }, { id: 1 }, { id: 2 }])
			.distinct((i, idx) => {
				seen.push(idx);
				return i.id;
			})
			.all();
		expect(seen).toEqual([0, 1, 2]);
	});

	it('should preserve first occurrence', () => {
		const result = new Queryable([
			{ id: 1, v: 'first' },
			{ id: 1, v: 'second' },
		])
			.distinct((i) => i.id)
			.all();
		expect(result).toEqual([{ id: 1, v: 'first' }]);
	});

	it('should handle an empty set', () => {
		const result = new Queryable<number>([]).distinct().all();
		expect(result).toEqual([]);
	});

	it('should handle a large set', () => {
		const result = new Queryable(largeSet).distinct().count();
		expect(result).toEqual(largeSetSize);
	});
});
// #endregion

// #region Resizers
describe('Queryable.skip', () => {
	it('should run', () => {
		const result = new Queryable([1, 2, 3, 4]).skip(3).all();
		expect(result).toEqual([4]);
	});

	it('should handle an empty set', () => {
		const result = new Queryable([]).skip(3).all();
		expect(result).toEqual([]);
	});

	it('should handle a large set', () => {
		const result = new Queryable(largeSet).skip(largeSetSize - 1).all();
		expect(result).toEqual([largeSetSize]);
	});
});

describe('Queryable.take', () => {
	it('should run', () => {
		const result = new Queryable([1, 2, 3, 4]).take(2).all();
		expect(result).toEqual([1, 2]);
	});

	it('should handle an empty set', () => {
		const result = new Queryable([]).take(2).all();
		expect(result).toEqual([]);
	});

	it('should handle a large set', () => {
		const result = new Queryable(largeSet).take(1).all();
		expect(result).toEqual([1]);
	});
});

describe('Queryable.take + Queryable.skip', () => {
	it('should run', () => {
		const result = new Queryable([1, 2, 3, 4]).skip(2).take(1).all();
		expect(result).toEqual([3]);
	});

	it('should handle an empty set', () => {
		const result = new Queryable([]).skip(2).take(1).all();
		expect(result).toEqual([]);
	});

	it('should handle a large set', () => {
		const result = new Queryable(largeSet)
			.skip(largeSetSize - 1)
			.take(1)
			.all();
		expect(result).toEqual([largeSetSize]);
	});
});
// #endregion

// #region Sorters
describe('Queryable.reverse', () => {
	it('should run', () => {
		const result = new Queryable([1, 2, 3, 4]).reverse().all();
		expect(result).toEqual([4, 3, 2, 1]);
	});

	it('should be chainable', () => {
		const result = new Queryable([1, 2, 3, 4])
			.reverse()
			.reverse()
			.reverse()
			.reverse()
			.reverse()
			.reverse()
			.reverse()
			.reverse()
			.reverse()
			.reverse()
			.all();
		expect(result).toEqual([1, 2, 3, 4]);
	});

	it('should handle an empty set', () => {
		const result = new Queryable([]).reverse().all();
		expect(result).toEqual([]);
	});

	it('should handle a large set', () => {
		const result = new Queryable(largeSet).reverse().first();
		expect(result).toEqual(largeSetSize);
	});
});

describe('Queryable.sort', () => {
	it('should run', () => {
		const result = new Queryable([{ value: 3 }, { value: 2 }, { value: 1 }, { value: 4 }])
			.sort((prev, curr) => prev.value - curr.value)
			.select((i) => i.value)
			.all();
		expect(result).toEqual([1, 2, 3, 4]);
	});

	it('should handle an empty set', () => {
		const result = new Queryable<number>([]).sort((prev, curr) => prev - curr).all();
		expect(result).toEqual([]);
	});

	it('should handle a large set', () => {
		const result = new Queryable<number>(largeSet).sort((prev, curr) => prev - curr).last();
		expect(result).toEqual(largeSetSize);
	});
});

describe('Queryable.sortByAsc', () => {
	it('should sort a number prop', () => {
		const result = new Queryable([{ value: 3 }, { value: 2 }, { value: 1 }, { value: 4 }])
			.sortByAsc('value')
			.select((i) => i.value)
			.all();
		expect(result).toEqual([1, 2, 3, 4]);
	});

	it('should sort a string prop', () => {
		const result = new Queryable([{ value: 3 }, { value: 2 }, { value: 1 }, { value: 4 }])
			.select((i) => ({ value: i.value.toString() }))
			.sortByAsc('value')
			.select((i) => i.value)

			.all();
		expect(result).toEqual(['1', '2', '3', '4']);
	});

	it('should throw on unsortable prop', () => {
		expect(() => new Queryable([3, 2, 1, 4]).sortByAsc('toFixed').all()).toThrow();
	});

	it('should throw on unmatched types', () => {
		expect(() =>
			new Queryable([{ value: 3 }, { value: '2' }, { value: '1' }, { value: 4 }]).sortByAsc('value').all()
		).toThrow();
	});

	it('should handle an empty set', () => {
		const result = new Queryable<{ value: number }>([])
			.sortByAsc('value')
			.select((i) => i.value)
			.all();
		expect(result).toEqual([]);
	});

	it('should handle a large set', () => {
		const result = new Queryable(largeSet)
			.select((i) => ({ value: i }))
			.sortByAsc('value')
			.select((i) => i.value)
			.last();
		expect(result).toEqual(largeSetSize);
	});
});

describe('Queryable.sortByDesc', () => {
	it('should sort a number prop', () => {
		const result = new Queryable([{ value: 3 }, { value: 2 }, { value: 1 }, { value: 4 }])
			.sortByDesc('value')
			.select((i) => i.value)
			.all();
		expect(result).toEqual([4, 3, 2, 1]);
	});

	it('should sort a string prop', () => {
		const result = new Queryable([{ value: 3 }, { value: 2 }, { value: 1 }, { value: 4 }])
			.select((i) => ({ value: i.value.toString() }))
			.sortByDesc('value')
			.select((i) => i.value)

			.all();
		expect(result).toEqual(['4', '3', '2', '1']);
	});

	it('should throw on unsortable prop', () => {
		expect(() => new Queryable([3, 2, 1, 4]).sortByDesc('toFixed').all()).toThrow();
	});

	it('should throw on unmatched types', () => {
		expect(() =>
			new Queryable([{ value: 3 }, { value: '2' }, { value: '1' }, { value: 4 }]).sortByDesc('value').all()
		).toThrow();
	});

	it('should handle an empty set', () => {
		const result = new Queryable<{ value: number }>([])
			.sortByDesc('value')
			.select((i) => i.value)
			.all();
		expect(result).toEqual([]);
	});

	it('should handle a large set', () => {
		const result = new Queryable(largeSet)
			.select((i) => ({ value: i }))
			.sortByDesc('value')
			.select((i) => i.value)
			.last();
		expect(result).toEqual(1);
	});
});

describe('Queryable.sortAsc', () => {
	it('should sort a number array', () => {
		const result = new Queryable([{ value: 3 }, { value: 2 }, { value: 1 }, { value: 4 }])
			.select((i) => i.value)
			.sortAsc()
			.all();
		expect(result).toEqual([1, 2, 3, 4]);
	});

	it('should sort a string array', () => {
		const result = new Queryable([{ value: 3 }, { value: 2 }, { value: 1 }, { value: 4 }])
			.select((i) => i.value.toString())
			.sortAsc()
			.all();
		expect(result).toEqual(['1', '2', '3', '4']);
	});

	it('should throw on unsortable type', () => {
		expect(() => new Queryable([{ value: 3 }, { value: 2 }, { value: 1 }, { value: 4 }]).sortAsc().all()).toThrow();
	});

	it('should throw on unmatched types', () => {
		expect(() => new Queryable([3, '2', '1', 4]).sortAsc().all()).toThrow();
	});

	it('should handle an empty set', () => {
		const result = new Queryable([]).sortAsc().all();
		expect(result).toEqual([]);
	});

	it('should handle a large set', () => {
		const result = new Queryable(largeSet).sortAsc().last();
		expect(result).toEqual(largeSetSize);
	});
});

describe('Queryable.sortDesc', () => {
	it('should sort a number array', () => {
		const result = new Queryable([{ value: 3 }, { value: 2 }, { value: 1 }, { value: 4 }])
			.select((i) => i.value)
			.sortDesc()
			.all();
		expect(result).toEqual([4, 3, 2, 1]);
	});

	it('should sort a string array', () => {
		const result = new Queryable([{ value: 3 }, { value: 2 }, { value: 1 }, { value: 4 }])
			.select((i) => i.value.toString())
			.sortDesc()
			.all();
		expect(result).toEqual(['4', '3', '2', '1']);
	});

	it('should throw on unsortable type', () => {
		expect(() => new Queryable([{ value: 3 }, { value: 2 }, { value: 1 }, { value: 4 }]).sortDesc().all()).toThrow();
	});

	it('should throw on unmatched types', () => {
		expect(() => new Queryable([3, '2', '1', 4]).sortDesc().all()).toThrow();
	});

	it('should handle an empty set', () => {
		const result = new Queryable([]).sortDesc().all();
		expect(result).toEqual([]);
	});

	it('should handle a large set', () => {
		const result = new Queryable(largeSet).sortDesc().last();
		expect(result).toEqual(1);
	});
});
// #endregion

// #region Pickers
describe('Queryable.sum', () => {
	it('should sum numbers', () => {
		const result = new Queryable([1, 2, 3, 4]).sum();
		expect(result).toEqual(10);
	});

	it('should sum objects', () => {
		const result = new Queryable([{ value: 1 }, { value: 2 }, { value: 3 }, { value: 4 }]).sum((i) => i.value);
		expect(result).toEqual(10);
	});

	it('should handle an empty set', () => {
		const result = new Queryable<number>([]).sum();
		expect(result).toEqual(0);
	});

	it('should handle a large set', () => {
		const result = new Queryable(largeSet).sum();
		expect(result).toEqual(largeSetSize * ((largeSetSize + 1) / 2));
	});
});

describe('Queryable.count', () => {
	it('should run', () => {
		const result = new Queryable([1, 2, 3, 4]).count();
		expect(result).toEqual(4);
	});

	it('should handle an empty set', () => {
		const result = new Queryable<number>([]).count();
		expect(result).toEqual(0);
	});

	it('should handle a large set', () => {
		const result = new Queryable(largeSet).count();
		expect(result).toEqual(largeSetSize);
	});
});

describe('Queryable.first', () => {
	it('should run', () => {
		const result = new Queryable([1, 2, 3, 4]).first();
		expect(result).toEqual(1);
	});

	it('should run with custom finder', () => {
		const result = new Queryable([1, 2, 3, 4]).first((i) => i > 2);
		expect(result).toEqual(3);
	});

	it('should return undefined on empty set', () => {
		const result = new Queryable([]).first();
		expect(result).toEqual(undefined);
	});
});

describe('Queryable.last', () => {
	it('should run', () => {
		const result = new Queryable([1, 2, 3, 4]).last();
		expect(result).toEqual(4);
	});

	it('should run with custom finder', () => {
		const result = new Queryable([1, 2, 3, 4]).last((i) => i < 3);
		expect(result).toEqual(2);
	});

	it('should return undefined on empty set', () => {
		const result = new Queryable([]).last();
		expect(result).toEqual(undefined);
	});
});

describe('Queryable.all', () => {
	it('should run', () => {
		const result = new Queryable([1, 2, 3, 4]).all();
		expect(result).toEqual([1, 2, 3, 4]);
	});

	it('should handle an empty set', () => {
		const result = new Queryable([]).all();
		expect(result).toEqual([]);
	});

	it('should handle a large set', () => {
		const result = new Queryable(largeSet).all();
		expect(result).toEqual(largeSet);
	});

	it('should return the same result when called multiple times', () => {
		const q = new Queryable([1, 2, 3, 4]).where((i) => i > 2);
		expect(q.all()).toEqual(q.all());
	});
});
// #endregion

// #region Grouping
describe('Queryable.groupBy', () => {
	it('should group by a primitive key', () => {
		const result = new Queryable([1, 2, 3, 4, 5, 6]).groupBy((i) => (i % 2 === 0 ? 'even' : 'odd')).all();
		expect(result).toEqual([
			{ key: 'odd', items: [1, 3, 5] },
			{ key: 'even', items: [2, 4, 6] },
		]);
	});

	it('should group by an object key', () => {
		const result = new Queryable([
			{ category: 'a', value: 1 },
			{ category: 'b', value: 2 },
			{ category: 'a', value: 3 },
		])
			.groupBy((i) => i.category)
			.all();
		expect(result).toEqual([
			{
				key: 'a',
				items: [
					{ category: 'a', value: 1 },
					{ category: 'a', value: 3 },
				],
			},
			{ key: 'b', items: [{ category: 'b', value: 2 }] },
		]);
	});

	it('should be chainable', () => {
		const result = new Queryable([1, 2, 3, 4, 5, 6])
			.groupBy((i) => (i % 2 === 0 ? 'even' : 'odd'))
			.where((g) => g.key === 'even')
			.select((g) => g.items)
			.all();
		expect(result).toEqual([[2, 4, 6]]);
	});

	it('should expose index and array in callback', () => {
		const indices: number[] = [];
		new Queryable([10, 20, 30])
			.groupBy((i, idx) => {
				indices.push(idx);
				return i;
			})
			.all();
		expect(indices).toEqual([0, 1, 2]);
	});

	it('should preserve insertion order of keys', () => {
		const result = new Queryable(['b', 'a', 'c', 'a', 'b'])
			.groupBy((i) => i)
			.select((g) => g.key)
			.all();
		expect(result).toEqual(['b', 'a', 'c']);
	});

	it('should handle an empty set', () => {
		const result = new Queryable<number>([]).groupBy((i) => i).all();
		expect(result).toEqual([]);
	});

	it('should handle a large set', () => {
		const result = new Queryable(largeSet)
			.groupBy((i) => (i % 2 === 0 ? 'even' : 'odd'))
			.select((g) => g.items.length)
			.all();
		expect(result).toEqual([largeSetSize / 2, largeSetSize / 2]);
	});
});
// #endregion

// #region Complex chains
describe('Queryable complex chains', () => {
	it('should chain correctly after distinct', () => {
		const result = new Queryable([1, 1, 2, 2, 3, 3])
			.distinct()
			.where((i) => i > 1)
			.select((i) => i * 10)
			.all();
		expect(result).toEqual([20, 30]);
	});

	it('should chain correctly after selectMany', () => {
		const result = new Queryable([
			[1, 2],
			[3, 4],
			[5, 6],
		])
			.selectMany((i) => i)
			.where((i) => i % 2 === 0)
			.select((i) => i * 10)
			.all();
		expect(result).toEqual([20, 40, 60]);
	});

	it('should support groupBy followed by selectMany to flatten groups', () => {
		const result = new Queryable([1, 2, 3, 4, 5, 6])
			.groupBy((i) => (i % 2 === 0 ? 'even' : 'odd'))
			.selectMany((g) => g.items)
			.sortAsc()
			.all();
		expect(result).toEqual([1, 2, 3, 4, 5, 6]);
	});

	it('should support select after groupBy to project group metadata', () => {
		const result = new Queryable(['apple', 'avocado', 'banana', 'blueberry', 'blackberry', 'cherry'])
			.groupBy((i) => i[0])
			.select((g) => ({ letter: g.key, count: g.items.length }))
			.sortByDesc('count')
			.first();
		expect(result).toEqual({ letter: 'b', count: 3 });
	});

	it('should support deeply nested chains', () => {
		const result = new Queryable([
			{ department: 'eng', salary: 100 },
			{ department: 'eng', salary: 200 },
			{ department: 'hr', salary: 150 },
			{ department: 'hr', salary: 50 },
		])
			.groupBy((i) => i.department)
			.select((g) => ({ department: g.key, total: g.items.reduce((acc, i) => acc + i.salary, 0) }))
			.sortByDesc('total')
			.select((g) => g.department)
			.all();
		expect(result).toEqual(['eng', 'hr']);
	});
});
// #endregion

// #region Immutability
describe('Queryable branching', () => {
	it('should not affect the original when chaining', () => {
		const base = new Queryable([1, 2, 3, 4]);
		const filtered = base.where((i) => i > 2);
		expect(base.all()).toEqual([1, 2, 3, 4]);
		expect(filtered.all()).toEqual([3, 4]);
	});

	it('should allow independent branches from the same base', () => {
		const base = new Queryable([1, 2, 3, 4]);
		const a = base.where((i) => i > 2);
		const b = base.where((i) => i < 3);
		expect(a.all()).toEqual([3, 4]);
		expect(b.all()).toEqual([1, 2]);
	});

	it('should allow independent branches mid-chain', () => {
		const base = new Queryable([1, 2, 3, 4]).where((i) => i > 1);
		const a = base.take(1);
		const b = base.skip(1).take(1);
		expect(a.all()).toEqual([2]);
		expect(b.all()).toEqual([3]);
	});

	it('should not affect a branch when extending another', () => {
		const base = new Queryable([1, 2, 3, 4]);
		const a = base.where((i) => i > 1);
		const b = a.skip(1);
		expect(a.all()).toEqual([2, 3, 4]);
		expect(b.all()).toEqual([3, 4]);
	});
});
// #endregion
