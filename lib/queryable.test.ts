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
});
// #endregion
