import { coordsToOffset, Coords, Grid, getFromGrid, isOutOfBounds, coordsMatch, createGrid } from './grid';

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

export type MoveType =
  | 'move'
  | 'capture'
  | 'castle'
  | 'en-pessant'
  | 'promotion'

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

// Creates a list of coordinates by continuously calling the `stepFn` until
// either a coord is out of bounds or a piece already occupies the square. If
// the piece is an enemy piece then it's square is included in the result (since
// it could be taken)
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

    // Empty square, good to land on
    if (!piece) {
      travelled.push(current);
    }
    // Enemy square, we can land here but can't keep going
    else if (piece.color === enemyColor(color)) {
      travelled.push(current);
      break;
    }
    // Friendly square, nowhere else to go
    else if (piece.color === color) {
      break;
    }

    prev = current;
  }

  return travelled;
};

// Creates a function that will check if a coord: exists in `moves`, isn't out of
// bounds, and isn't occupied by a friendly piece
const createMoveValidator = (
  pieces: PiecesOnBoard,
  color: PieceColor,
  moves: Coords[]
) => {
  const movesSet = new Set(moves
    .filter(xy => !isOutOfBounds(xy))
    .map(coordsToOffset)
  );
  return (coords: Coords) => (
    movesSet.has(coordsToOffset(coords))
    && !isOutOfBounds(coords)
    && (
      !getFromGrid(pieces, coords)
      || getFromGrid(pieces, coords)?.color === enemyColor(color)
    )
  )
}

//-----------------------------------------------------------------------------
// Rook
//-----------------------------------------------------------------------------
const movesForRook: MoveFn = (pieces, square, color) => {
  const traverse = (fn: (c: Coords) => Coords) => (
    traverseUntilStopped(pieces, square, color, fn)
  );

  const isValidMove = createMoveValidator(pieces, color, [
    ...traverse(([x, y]) => ([x, y - 1])), // Up
    ...traverse(([x, y]) => ([x, y + 1])), // Down
    ...traverse(([x, y]) => ([x - 1, y])), // Left
    ...traverse(([x, y]) => ([x + 1, y])), // Right
  ]);

  return createGrid(isValidMove);
}

//-----------------------------------------------------------------------------
// Bishop
//-----------------------------------------------------------------------------
const movesForBishop: MoveFn = (pieces, square, color) => {
  const traverse = (fn: (c: Coords) => Coords) => (
    traverseUntilStopped(pieces, square, color, fn)
  );

  const isValidMove = createMoveValidator(pieces, color, [
    ...traverse(([x, y]) => ([x - 1, y - 1])), // Up left
    ...traverse(([x, y]) => ([x + 1, y - 1])), // Up right
    ...traverse(([x, y]) => ([x - 1, y + 1])), // Down left
    ...traverse(([x, y]) => ([x + 1, y + 1])), // Down right
  ]);

  return createGrid(isValidMove);
}

//-----------------------------------------------------------------------------
// Queen
//-----------------------------------------------------------------------------
const movesForQueen: MoveFn = (pieces, square, color) => {
  const traverse = (fn: (c: Coords) => Coords) => (
    traverseUntilStopped(pieces, square, color, fn)
  );

  const isValidMove = createMoveValidator(pieces, color, [
    ...traverse(([x, y]) => ([x, y - 1])), // Up
    ...traverse(([x, y]) => ([x, y + 1])), // Down
    ...traverse(([x, y]) => ([x - 1, y])), // Left
    ...traverse(([x, y]) => ([x + 1, y])), // Right
    ...traverse(([x, y]) => ([x - 1, y - 1])), // Up left
    ...traverse(([x, y]) => ([x + 1, y - 1])), // Up right
    ...traverse(([x, y]) => ([x - 1, y + 1])), // Down left
    ...traverse(([x, y]) => ([x + 1, y + 1])), // Down right
  ]);

  return createGrid(isValidMove);
}

//-----------------------------------------------------------------------------
// Knight
//-----------------------------------------------------------------------------
const movesForKnight: MoveFn = (pieces, [x, y], color) => {
  const isValidMove = createMoveValidator(pieces, color, [
    [x - 1, y - 2],
    [x + 1, y - 2],
    [x - 2, y - 1],
    [x + 2, y - 1],
    [x - 1, y + 2],
    [x + 1, y + 2],
    [x - 2, y + 1],
    [x + 2, y + 1],
  ]);

  return createGrid(isValidMove);
}

//-----------------------------------------------------------------------------
// King
//-----------------------------------------------------------------------------
const movesForKing: MoveFn = (pieces, [x, y], color) => {
  const isValidMove = createMoveValidator(pieces, color, [
    [x, y - 1],
    [x, y + 1],
    [x - 1, y],
    [x + 1, y],
    [x - 1, y - 1],
    [x + 1, y - 1],
    [x - 1, y + 1],
    [x + 1, y + 1],
  ]);

  return createGrid(isValidMove);
}

//-----------------------------------------------------------------------------
// Pawn
//-----------------------------------------------------------------------------
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
  const firstMove: Coords = (
    (team === 'top')
      ? [x, y + 2]
      : [x, y - 2]
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
    || (
      team === 'top'
      && y == 1
      && coordsMatch(firstMove, square)
    )
    || (
      team === 'bottom'
      && y == 6
      && coordsMatch(firstMove, square)
    )
  ))
}

const pieceMoves: Record<PieceType, MoveFn> = {
  pawn: movesForPawn,
  rook: movesForRook,
  bishop: movesForBishop,
  knight: movesForKnight,
  king: movesForKing,
  queen: movesForQueen,
};

export function movesForPiece(
  pieces: PiecesOnBoard,
  piece: Piece,
  team: PieceTeam,
  square: Coords
): Grid<boolean> {
  const moves = pieceMoves[piece.type](pieces, square, piece.color, team);
  // @TODO: remove things that would put you in check
  // @TODO: en passant https://en.wikipedia.org/wiki/En_passant
  // @TODO: castling https://en.wikipedia.org/wiki/Castling#Requirements
  return moves;
}