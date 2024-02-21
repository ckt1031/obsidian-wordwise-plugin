function toSnakeCase(str: string): string {
	return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
type Dictionary<T = any> = Record<string, T>;

export function convertKeysToSnakeCase(
	obj: Dictionary | Array<Dictionary>,
): Dictionary | Array<Dictionary> {
	if (Array.isArray(obj)) {
		return obj.map(convertKeysToSnakeCase);
	}

	if (obj !== null && obj.constructor === Object) {
		return Object.keys(obj).reduce((result: Dictionary, key: string) => {
			const newResult = Object.assign({}, result);
			newResult[toSnakeCase(key)] = convertKeysToSnakeCase(obj[key]);
			return newResult;
		}, {});
	}

	return obj;
}

if (import.meta.vitest) {
	const { it, expect } = import.meta.vitest;
	it('convertKeysToSnakeCase', () => {
		const camelCaseObj = {
			firstName: 'John',
			lastName: 'Doe',
			address: {
				streetName: 'Main St',
				city: 'New York',
			},
		};

		const snakeCaseObj = {
			first_name: 'John',
			last_name: 'Doe',
			address: {
				street_name: 'Main St',
				city: 'New York',
			},
		};

		expect(convertKeysToSnakeCase(camelCaseObj)).toEqual(snakeCaseObj);
	});
}
