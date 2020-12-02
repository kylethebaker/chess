import { nothing, html, TemplateResult } from 'lit-html';
import { classMap } from 'lit-html/directives/class-map';
import { getFromGrid, coordsMatch, createGrid, squareColor, Coords } from './grid';
import { Piece, PieceType } from './pieces';
import { getTurnColor, Store, getSelectedSquare, getPieces, selectSquare, getHoveredSquare, hoverSquare, getPossibleMoves } from './state';

const pieceGlyphs: Record<PieceType, string> = {
  king: '♚',
  queen: '♛',
  rook: '♜',
  bishop: '♝',
  knight: '♞' ,
  pawn: '♟',
} as const;

export function rootTemplate(store: Store) {
  return html`
    <div class="wrapper">
      <section class="info-bar-section">
        ${infoTemplate(store)}
      </section>
      <section class="board-section">
        ${boardTemplate(store)}
      </section>
    </div>
  `;
}

export function infoTemplate(store: Store) {
  const turnColor = getTurnColor(store.getState());
  return html`
    <div>${turnColor === 'white' ? 'White' : 'Black'}'s turn</div>
  `;
}

export function boardTemplate(store: Store) {
  const pieces = getPieces(store.getState());
  const selected = getSelectedSquare(store.getState());
  const hovered = getHoveredSquare(store.getState());
  const possibleMoves = getPossibleMoves(store.getState());
  const turnColor = getTurnColor(store.getState());

  const squares = createGrid(([x, y]) => {
    const piece = getFromGrid(pieces, [x, y]);
    const onClick = () => store.dispatch(selectSquare([x, y]));
    // const onHover =  () => store.dispatch(hoverSquare([x, y]));
    const onHover = () => undefined;
    const indicatorClasses = classMap({
      'square-indicator': true,
      selected: coordsMatch([x, y], selected),
      hovered: coordsMatch([x, y], hovered),
      possible: !!possibleMoves && getFromGrid(possibleMoves, [x, y]),
    });
    return html`
      <div
        coords="[${x}, ${y}]"
        class="square ${squareColor(x, y)}"
        @mouseover="${onHover}"
        @click="${onClick}">
          <div class="${indicatorClasses}">
            ${piece ? pieceTemplate(piece) : nothing}
          </div>
      </div>`;
  });

  const boardClasses = classMap({
    board: true,
    'blacks-turn': turnColor === 'black',
    'whites-turn': turnColor === 'white',
    'no-selection': selected === null
  });

  return html`
    <div class="${boardClasses}">
      ${squares}
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
