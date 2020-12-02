import { ThunkAction, createSelector, configureStore, createReducer, createAction } from '@reduxjs/toolkit';
import { initialPiecePlacement } from './board';
import { setInGrid, getFromGrid, coordsMatch, Coords, Grid } from './grid';
import { PiecesOnBoard, movesForPiece, Piece, PieceTeam, PieceColor } from './pieces';

export interface State {
  whoseTurn: PieceTeam | null,
  teamColors: { [t in PieceTeam]: PieceColor },
  selectedSquare: Coords | null,
  hoveredSquare: Coords | null,
  pieces: PiecesOnBoard,
  possibleMoves: Grid<boolean> | null,
  gameLog?: Array<{
    team: PieceTeam,
    move: { from: Coords, to: Coords | null }
  }>
}

export type Thunk = (...args: any[]) => ThunkAction<void, State, unknown, any>;

const initialState: State = {
  whoseTurn: 'bottom',
  teamColors: {
    bottom: 'white',
    top: 'black',
  },
  selectedSquare: null,
  hoveredSquare: null,
  pieces: initialPiecePlacement(),
  possibleMoves: null
};

export const getPieces = (s: State) => s.pieces;
export const getSelectedSquare = (s: State) => s.selectedSquare;
export const getHoveredSquare = (s: State) => s.hoveredSquare;
export const getPossibleMoves = (s: State) => s.possibleMoves;
export const getWhoseTurn = (s: State) => s.whoseTurn;

export const getTurnColor = createSelector(
  getWhoseTurn,
  (s: State) => s.teamColors,
  (turn, colors) => turn ? colors[turn] : null
);

export const getSelectedPiece = createSelector(
  getPieces,
  getSelectedSquare,
  (pieces, square) => (
    (square && getFromGrid(pieces, square))
      ? getFromGrid(pieces, square)
      : null
  )
);

export const hoverSquare = createAction<Coords>('input/hover-square');
export const setSquareHovered = createAction<Coords | null>('board/set-hovered');
export const setSquareSelected = createAction<Coords | null>('board/set-selected');
export const setPossibleMoves = createAction<Grid<boolean> | null>('board/set-possible-moves');
export const setWhoseTurn = createAction<PieceTeam>('board/set-whose-turn');
export const movePiece = createAction<{ from: Coords, to: Coords | null }>('board/move-piece');

export const endTurn: Thunk = () => (dispatch, getState) => {
  const whoseTurn = getWhoseTurn(getState());
  if (whoseTurn) {
    dispatch(setWhoseTurn(whoseTurn === 'top' ? 'bottom' : 'top'));
  }
};

export const selectSquare: Thunk = (square: Coords) => (dispatch, getState) => {
  const existingSelection = getSelectedSquare(getState());
  const pieces = getPieces(getState());
  const piece = getFromGrid(pieces, square);
  const possibleMoves = getPossibleMoves(getState());
  const whoseTurn = getWhoseTurn(getState());
  const turnColor = getTurnColor(getState());

  // @TODO: could be better determined, but this would be like 'waiting on
  // player to join' or something
  if (!whoseTurn) {
    return;
  }

  if (!existingSelection) {
    if (piece?.color === turnColor) {
      const possibleMoves = movesForPiece(pieces, piece, whoseTurn, square);
      dispatch(setSquareSelected(square));
      dispatch(setPossibleMoves(possibleMoves));
    }
    return;
  }

  // The selection is no longer valid after doing a second click, regardless if
  // we're cancelling the selection, switching it to another piece, or
  // moving/capturing
  dispatch(setSquareSelected(null));
  dispatch(setPossibleMoves(null));

  // If we're clicking on a possible square then its a move/capture
  if (possibleMoves && getFromGrid(possibleMoves, square)) {
    dispatch(movePiece({ from: existingSelection, to: square }));
    dispatch(endTurn());
  }
  // If we're jumping from selecting one piece to another of the same color then
  // switch the selection instead of cancelling. This will recurse but we've
  // already cleared out the selection so it shouldn't be infinite
  else if (
    piece?.color === getFromGrid(pieces, existingSelection)?.color
    && !coordsMatch(square, existingSelection)
  ) {
    dispatch(selectSquare(square));
  }
};

export const mainReducer = createReducer(initialState, (b) => {
  b.addCase(setSquareSelected, (state, { payload }) => {
    state.selectedSquare = payload;
  });
  b.addCase(hoverSquare, (state, { payload }) => {
    state.hoveredSquare = payload;
  });
  b.addCase(setPossibleMoves, (state, { payload }) => {
    state.possibleMoves = payload;
  });
  b.addCase(setWhoseTurn, (state, { payload }) => {
    state.whoseTurn = payload;
  });
  b.addCase(movePiece, (state, { payload }) => {
    const { to, from } = payload;
    const pieceMoved = getFromGrid(state.pieces, from);
    setInGrid(state.pieces, from, null);
    if (to) {
      setInGrid(state.pieces, to, pieceMoved);
    }
  });
})

export const createStore = () => configureStore({
  reducer: mainReducer,
})

export type Store = ReturnType<typeof createStore>
