import { Coords, Grid, getFromGrid, isOutOfBounds, coordsMatch, createGrid } from './grid';

export type PieceTeam = 
  | 'top'
  | 'bottom';

export type PieceColor =
  | 'black'
  | 'white';

export type PieceType =
  | 'rook'
  | 'bishop'
  | 'knight'
  | 'king'
  | 'queen'
  | 'pawn';

export interface Piece {
  type: PieceType;
  color: PieceColor;
}

export type PiecesOnBoard = Grid<Piece | null>;

type MoveFn = (
  pieces: PiecesOnBoard,
  [x, y]: Coords,
  color: PieceColor,
  team: PieceTeam,
) => Grid<boolean>;

const enemyColor = (
  (color: PieceColor): PieceColor => (
    (color === 'white')
      ? 'black'
      : 'white'
  )
);

const traverseUntilStopped = (
  pieces: PiecesOnBoard,
  startSquare: Coords, 
  color: PieceColor, 
  stepFn: (current: Coords) => Coords,
): Coords[] => {
  const travelled: Coords[] = []
  let prev = startSquare;
  while (true) {
    const current = stepFn(prev);

    if (isOutOfBounds(current)) {
      break;
    }

    const piece = getFromGrid(pieces, current);

    if (!piece) {
      travelled.push(current);
    } else if (piece.color === enemyColor(color)) {
      travelled.push(current);
      break;
    } else if (piece.color === color) {
      break;
    }

    prev = current;
  }
  return travelled;
};

const movesForRook: MoveFn = (pieces, [x, y], color, team) => {
  return createGrid(([x, y]) => {

  })
}

const movesForPawn: MoveFn = (pieces, [x, y], color, team) => {
  const moveForward: Coords = (
    (team === 'top')
      ? [x, y + 1]
      : [x, y - 1]
  );
  const takeLeft: Coords = (
    (team === 'top')
      ? [x - 1, y + 1]
      : [x + 1, y - 1]
  );
  const takeRight: Coords = (
    (team === 'top')
      ? [x + 1, y + 1]
      : [x - 1, y - 1]
  );
  return createGrid(square => (
    (
      coordsMatch(moveForward, square)
      && getFromGrid(pieces, moveForward) === null
      && !isOutOfBounds(moveForward)
    )
    || (
      coordsMatch(takeLeft, square)
      && !isOutOfBounds(takeLeft)
      && getFromGrid(pieces, takeLeft)?.color === enemyColor(color)
    )
    || (
      coordsMatch(takeRight, square)
      && !isOutOfBounds(takeRight)
      && getFromGrid(pieces, takeRight)?.color === enemyColor(color)
    )
  ));
}

const pieceMoves: Record<PieceType, MoveFn> = {
  pawn: movesForPawn,
  rook: movesForRook,
  bishop: (() => null) as any,
  knight: (() => null) as any,
  king: (() => null) as any,
  queen: (() => null) as any,
};

export function movesForPiece(
  pieces: PiecesOnBoard,
  piece: Piece,
  team: PieceTeam,
  square: Coords
): Grid<boolean> {
  return (pieceMoves[piece.type])
    ? pieceMoves[piece.type](pieces, square, piece.color, team)
    : createGrid(_ => false);
}