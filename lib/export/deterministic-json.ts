type JSONPrimitive = string | number | boolean | null;
type JSONValue = JSONPrimitive | JSONValue[] | { [key: string]: JSONValue };

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null && !Array.isArray(value);

const sortObject = (value: unknown): JSONValue => {
	if (Array.isArray(value)) {
		return value.map((item) => sortObject(item));
	}

	if (isRecord(value)) {
		const objectValue = value;
		const sortedKeys = Object.keys(objectValue).sort((a, b) => a.localeCompare(b));

		return sortedKeys.reduce<{ [key: string]: JSONValue }>((acc, key) => {
			acc[key] = sortObject(objectValue[key]);
			return acc;
		}, {});
	}

	return value as JSONPrimitive;
};

export const deterministicJsonStringify = (value: unknown, spacing = 2): string => JSON.stringify(sortObject(value), null, spacing);
