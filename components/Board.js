import React from 'react';
import * as R from 'rambda';
import * as Cell from './Cell';
import * as L from '../lib/index';

// LOGIC =====================================================
// let cell1 = ...
// let board = [cell1, cell2, cell3 ...]

export const getStatusAt = R.curry((i, board) => {
	return R.view(R.lensPath(`${i}.status`), board);
});

export const setStatusAt = R.curry((i, status, board) => {
	// 1. manual nesting
	// 2. immer
	// 3. lensimg
	// return { ...board, [i]: { ...board[i], status } };

	return R.set(R.lensPath(`${i}.status`), status, board);
});

export const setStatusesBy = R.curry((predFn, status, board) => {
	return R.map(cell => (predFn(cell) ? { ...cell, status } : cell), board);
});

export const getStatusesBy = R.curry((predFn, board) => {
	return R.chain(cell => (predFn(cell) ? [cell.status] : []), board);
});

export const getSymbolsBy = R.curry((predFn, board) => {
	return R.chain(cell => (predFn(cell) ? [cell.symbol] : []), board);
});

export const canOpenAt = R.curry((i, board) => {
	return (
		i < board.length &&
		Cell.isClosed(board[i]) &&
		getStatusesBy(Cell.isBlocking, board).length < 2
	);
});

export const areOpensEqual = board => {
	const openSymbols = getSymbolsBy(Cell.isOpen, board);
	return openSymbols.length >= 2 && L.allEquals(openSymbols);
};

export const areOpensDifferent = board => {
	const openSymbols = getSymbolsBy(Cell.isOpen, board);
	return openSymbols.length >= 2 && !L.allEquals(openSymbols);
};

const charCodeA = 'A'.charCodeAt(0);

export const makeRandom = (m, n) => {
	if ((m * n) / 2 > 26) throw new Error('too big');
	if ((m * n) % 2) throw new Error('must be even');

	return R.pipe(
		() => R.range(0, (m * n) / 2), // ["A", "B", "C"]
		R.map(i => String.fromCharCode(i + charCodeA)),
		R.chain(x => [x, x]),
		L.shuffle,
		R.map(symbol => ({ symbol, status: Cell.Status.Closed }))
	)();
};

// VIEW ======================================================
export const BoardView = ({ board, onClickAt }) => {
	return (
		<>
			<div className="board">
				{board.map((cell, i) => (
					<Cell.View
						key={i}
						cell={cell}
						onClick={_ => onClickAt(i)}
					/>
				))}
			</div>
			<style jsx>{`
				.board {
					display: grid;
					grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
					grid-template-rows: 1fr 1fr 1fr 1fr 1fr 1fr;
					min-width: 350px;
					min-height: 480px;
					gap: 2px;
					align-self: center;
				}
			`}</style>
		</>
	);
};

export function ScreenView({ background, children }) {
	return (
		<>
			<div className="screen">{children}</div>
			<style jsx>{`
				.screen {
					display: flex;
					width: 360px;
					flex-direction: column;
					height: 480px;
					align-items: center;
					justify-content: center;
					/* cursor: pointer; */
					background: ${background};
				}

				:global(.screen h1) {
					font-size: 3rem;
				}
				:global(.screen p) {
					font-size: 1.4rem;
				}
			`}</style>
		</>
	);
}
