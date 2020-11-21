import { ThunkAction, createSelector, configureStore, createReducer, createAction } from '@reduxjs/toolkit';
import { initialPiecePlacement } from './board';
import { setInGrid, getFromGrid, coordsMatch, Coords, Grid } from './grid';
import { PiecesOnBoard, movesForPiece, Piece, PieceTeam } from './pieces';

export interface State {
  selectedSquare: Coords | null,
  hoveredSquare: Coords | null,
  pieces: PiecesOnBoard,
  possibleMoves: Grid<boolean> | null,
}

export type Thunk = (...args: any[]) => ThunkAction<void, State, unknown, any>;

const initialState: State = {
  selectedSquare: null,
  hoveredSquare: null,
  pieces: initialPiecePlacement(),
  possibleMoves: null
};

export const getPieces = (s: State) => s.pieces;
export const getSelectedSquare = (s: State) => s.selectedSquare;
export const getHoveredSquare = (s: State) => s.hoveredSquare;
export const getPossibleMoves = (s: State) => s.possibleMoves;

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
export const movePiece = createAction<{ from: Coords, to: Coords | null }>('board/move-piece');

export const selectSquare: Thunk = (square: Coords) => (dispatch, getState) => {
  const existingSelection = getSelectedSquare(getState());
  const pieces = getPieces(getState());
  const piece = getFromGrid(pieces, square);
  const possibleMoves = getPossibleMoves(getState());

  if (!existingSelection) {
    if (piece) {
      // @TODO: this wouldn't work for two-player, it would come from whoever's
      // turn it is
      const team: PieceTeam = piece.color === 'white' ? 'bottom' : 'top';
      const possibleMoves = movesForPiece(pieces, piece, team, square);
      dispatch(setSquareSelected(square));
      dispatch(setPossibleMoves(possibleMoves));
    }
  } else {
    if (possibleMoves && getFromGrid(possibleMoves, square)) {
      dispatch(movePiece({ from: existingSelection, to: square }))
    }
    dispatch(setSquareSelected(null));
    dispatch(setPossibleMoves(null));
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
  b.addCase(movePiece, (state, { payload }) => {
    const { to, from } = payload;
    const piece = getFromGrid(state.pieces, from);
    setInGrid(state.pieces, from, null);
    if (to) {
      setInGrid(state.pieces, to, piece);
    }
  });
})

export const createStore = () => configureStore({
  reducer: mainReducer,
})

export type Store = ReturnType<typeof createStore>
