import { range } from './utils';

export type Coords = [number, number];
export type Grid<T> = T[][]; 
export type GridFillFn<T> = (coords: Coords) => T

export function createGrid<T>(fillFn: GridFillFn<T>): Grid<T> {
  const grid: Grid<T> = [];

  for (const y of range(8)) {
    for (const x of range(8)) {
      (grid[y] ??= [])[x] = fillFn([x, y]);
    }
  }

  return grid;
}

export function isOutOfBounds<T>([x, y]: Coords): boolean {
  return x < 0 || y < 0 ||x >= 8 || y >= 8;
}

export function getFromGrid<T>(grid: Grid<T>, [x, y]: Coords): T {
  return grid[y][x];
}

export function setInGrid<T>(grid: Grid<T>, [x, y]: Coords, val: T): void {
  grid[y][x] = val;
}

export function coordsMatch(a: Coords | null, b: Coords | null): boolean {
  return (a !== null && b !== null && a[0] === b[0] && a[1] === b[1]);
}

export function offsetToCoords(n: number): [number, number] {
  return [n % 8, Math.floor(n / 8)]
}

export function coordsToOffset([x, y]: Coords): number {
  return (8 * y + x)
}

export function flattenGrid<T>(grid: Grid<T>): T[] {
  return grid.flat();
}

export function expandToGrid<T>(flat: T[]) {
  return createGrid(coords => flat[coordsToOffset(coords)]);
}

export function mapGrid<X, Y>(grid: Grid<X>, fn: (x: X) => Y): Grid<Y> {
  return expandToGrid(flattenGrid(grid).map(fn));
}

export function squareColor(x: number, y: number) {
  return ((x + y) % 2 === 0) ? 'white' : 'black'
}