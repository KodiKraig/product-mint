export type ParsedValueTypes = 'number' | 'boolean' | 'string';

export const parseCommaSeparatedList = <T>(
  list: string,
  type: ParsedValueTypes = 'string',
): T[] => {
  if (!list.includes(',')) {
    const value = parseValue(list, type);
    return [value as T];
  }

  const split = list.split(',');

  if (split.length === 0) {
    throw new Error('List cannot be empty');
  }

  return split.map((item) => {
    return parseValue(item, type) as T;
  });
};

const parseValue = (value: string, type: ParsedValueTypes) => {
  if (type === 'boolean') {
    return parseBooleanValue(value);
  }

  if (type === 'number') {
    return parseNumericValue(value);
  }

  return value;
};

const parseNumericValue = (value: string): number | null => {
  if (!value || value === '' || Number.isNaN(Number(value))) {
    return null;
  }

  return Number(value);
};

const parseBooleanValue = (value: string): boolean | null => {
  if (!value || value === '') {
    return null;
  }

  if (value.toLowerCase() === 'true') {
    return true;
  }

  if (value.toLowerCase() === 'false') {
    return false;
  }

  return null;
};
