export const parseCommaSeparatedList = <T>(list: string): T[] => {
  if (!list.includes(',')) {
    return [list as T];
  }

  const split = list.split(',');

  if (split.length === 0) {
    throw new Error('List cannot be empty');
  }

  return split.map((item) => item as T);
};
