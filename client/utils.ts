export const range = (
  startOrStop: number,
  maybeStop?: number
) => {
  let [current, stop] = (
    (maybeStop === undefined)
      ? [0, startOrStop]
      : [startOrStop, maybeStop]
  );

  return {
    map<X>(fn: (n: number) => X): X[] {
      const xs: X[] = [];
      for (const n of this) {
        xs.push(fn(n));
      }
      return xs;
    },
    *[Symbol.iterator]() {
      while (current < stop) {
        yield current++;
      }
    }
  };
}