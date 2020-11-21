import { range } from './utils';
import { Grid } from './grid';
import { PieceType, Piece } from './pieces';

const pawnRow: PieceType[] = range(8).map(_ => 'pawn');
const coolRow: PieceType[] = ['rook', 'bishop', 'knight', 'queen', 'king', 'knight', 'bishop', 'rook'];
const emptyRow: (PieceType| null)[] = range(8).map(_ => null);

export const initialPiecePlacement = () => [
  coolRow.map(type => ({ type, color: 'black' })),
  pawnRow.map(type => ({ type, color: 'black' })),
  [...emptyRow],
  [...emptyRow],
  [...emptyRow],
  [...emptyRow],
  pawnRow.map(type => ({ type, color: 'white' })),
  coolRow.map(type => ({ type, color: 'white' })),
] as Grid<Piece>;