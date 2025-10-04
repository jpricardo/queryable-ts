# queryable-ts

A C# Linq-like fluent interface for array manipulation in TypeScript.

> **Note:** This project is a proof of concept created by a student for learning purposes. It is not intended for production use.

## Description

`queryable-ts` provides a `Queryable` class that wraps an array and allows for chaining multiple data manipulation methods in a style similar to C#'s LINQ. This allows for more readable and expressive queries on collections.

## Features

- Fluent, chainable API.
- Lazy evaluation is not implemented; the query is executed when a terminal method like `.all()` is called.
- Methods for filtering, projecting, sorting, and element selection.
- Strongly typed to leverage TypeScript's static analysis.

## Usage

First, import the `Queryable` class and instantiate it with your array.

```typescript
import { Queryable } from './lib/queryable';

const people = [
	{ name: 'Alice', age: 30 },
	{ name: 'Bob', age: 25 },
	{ name: 'Charlie', age: 35 },
	{ name: 'David', age: 25 },
];

// Create a query
const query = new Queryable(people);

// Chain methods to transform the data
const namesOfPeopleOver25 = query
	.where((person) => person.age > 25)
	.sortByAsc('name')
	.select((person) => person.name)
	.all(); // Execute the query and get the results

console.log(namesOfPeopleOver25); // Output: ['Alice', 'Charlie']
```

## API

The Queryable class implements the following methods:

#### Selectors

- `select<K>(cb)`: Projects each element of a sequence into a new form.
- `where(cb)`: Filters a sequence of values based on a predicate.

#### Resizers

- `skip(amount)`: Bypasses a specified number of elements in a sequence.
- `take(amount)`: Returns a specified number of contiguous elements from the start of a sequence.

#### Sorters

- `reverse()`: Inverts the order of the elements in a sequence.
- `sort(cb)`: Sorts the elements using a custom comparer function.
- `sortByAsc(key)`: Sorts objects in ascending order based on a property key.
- `sortByDesc(key)`: Sorts objects in descending order based on a property key.
- `sortAsc()`: Sorts an array of strings or numbers in ascending order.
- `sortDesc()`: Sorts an array of strings or numbers in descending order.

#### Pickers (Terminal Methods)

These methods execute the query and return a value.

- `all()`: Returns all elements of the sequence as an array.
- `count()`: Returns the number of elements in the sequence.
- `sum(cb?)`: Computes the sum of a sequence of numeric values.
- `first(cb?)`: Returns the first element of a sequence, or the first element that satisfies a condition.
- `last(cb?)`: Returns the last element of a sequence, or the last element that satisfies a condition.

## Development

To work on this project, clone the repository and install the dependencies.

```bash
npm install
```

### Running Tests

You can run the unit tests using Vitest:

```bash
npm run test
```

To generate a coverage report, run:

```bash
npm run coverage
```

The report will be available in the `coverage` directory.

## License

This project is licensed under the ISC License. See the `package.json` file for details.
