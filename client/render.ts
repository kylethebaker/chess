import { nothing, html, TemplateResult } from 'lit-html';
import { getFromGrid, coordsMatch, createGrid, squareColor, Coords } from './grid';
import { Piece, PieceType } from './pieces';
import { Store, getSelectedSquare, getPieces, selectSquare, getHoveredSquare, hoverSquare, getPossibleMoves } from './state';

const pieceGlyphs: Record<PieceType, string> = {
  king: '♚',
  queen: '♛',
  rook: '♜',
  bishop: '♝',
  knight: '♞' ,
  pawn: '♟',
} as const;

export function rootTemplate(store: Store) {
  const pieces = getPieces(store.getState());
  const selected = getSelectedSquare(store.getState());
  const hovered = getHoveredSquare(store.getState());
  const possibleMoves = getPossibleMoves(store.getState());

  const squares = createGrid(([x, y]) => {
    const piece = getFromGrid(pieces, [x, y]);
    return squareTemplate({
      pieceEl: piece ? pieceTemplate(piece) : null,
      color: squareColor(x, y),
      isSelected: coordsMatch([x, y], selected),
      isHovered: coordsMatch([x, y], hovered),
      isPossibleMove: !!possibleMoves && getFromGrid(possibleMoves, [x, y]),
      onClick: () => store.dispatch(selectSquare([x, y])),
      //onHover: () => store.dispatch(hoverSquare([x, y])),
      onHover: () => undefined,
      coords: [x, y]
    });
  });

  return html`<div class="board">${squares}</div>`;
}

interface SquareOptions {
  coords: Coords,
  color: 'black' | 'white';
  pieceEl: TemplateResult | null;
  isSelected: boolean;
  isHovered: boolean;
  isPossibleMove: boolean;
  onClick: () => void;
  onHover: () => void;
}

export function squareTemplate(opts: SquareOptions) {
  const selected = opts.isSelected ? 'selected' : '';
  const hovered = opts.isHovered ? 'hovered' : '';
  const possible = opts.isPossibleMove ? 'possible' : '';
  return html`
      <div
        coords="[${opts.coords[0]}, ${opts.coords[1]}]"
        class="square ${opts.color}"
        @mouseover="${opts.onHover}"
        @click="${opts.onClick}">
          <div class="square-indicator ${selected} ${hovered} ${possible}">
            ${opts.pieceEl ?? nothing}
          </div>
      </div>`;
}

export function pieceTemplate({ type, color }: Piece) {
  return html`
    <span
      class="piece piece-${type} ${color}">
      ${pieceGlyphs[type]}
    </span>
  `;
}
