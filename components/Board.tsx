import React from 'react';
import * as R from 'rambda';
import * as Cell from './Cell';
import * as L from '../lib/index';

// LOGIC =====================================================
// let cell1 = ...
// let board = [cell1, cell2, cell3 ...]

export type Board = Cell.Cell[];

export const getStatusAt =
	(i: number) =>
	(board: Board): Cell.Status =>
		R.view(R.lensPath(`${i}.status`), board);

export const setStatusAt =
	(i: number) =>
	(status: Cell.Status) =>
	(board: Board): Board =>
		R.set(R.lensPath(`${i}.status`), status, board);

export const getStatusesBy =
	(predFn: Cell.PredFn) =>
	(board: Board): Cell.Status[] =>
		[
			...R.chain(
				(cell: Cell.Cell) => (predFn(cell) ? [cell.status] : []),
				board
			),
		];

export const setStatusesBy =
	(predFn: Cell.PredFn) =>
	(status: Cell.Status) =>
	(board: Board): Board =>
		[
			...R.map(
				(cell: Cell.Cell) =>
					predFn(cell) ? { ...cell, status } : cell,
				board
			),
		];

export const getSymbolsBy =
	(predFn: Cell.PredFn) =>
	(board: Board): string[] =>
		[
			...R.chain(
				(cell: Cell.Cell) => (predFn(cell) ? [cell.symbol] : []),
				board
			),
		];

export const canOpenAt =
	(i: number) =>
	(board: Board): boolean =>
		i < board.length &&
		Cell.isClosed(board[i]) &&
		getStatusesBy(Cell.isBlocking)(board).length < 2;

export const areOpensEqual = (board: Board): boolean => {
	const openSymbols = getSymbolsBy(Cell.isOpen)(board);
	return openSymbols.length >= 2 && L.allEquals(openSymbols);
};

export const areOpensDifferent = (board: Board): boolean => {
	const openSymbols = getSymbolsBy(Cell.isOpen)(board);
	return openSymbols.length >= 2 && !L.allEquals(openSymbols);
};

const charCodeA = 'A'.charCodeAt(0);

export const makeRandom = (m: number, n: number): Board => {
	if ((m * n) / 2 > 26) throw new Error('too big');
	if ((m * n) % 2) throw new Error('must be even');

	return R.pipe(
		() => R.range(0, (m * n) / 2), // ["A", "B", "C"]
		R.map((i: number) => String.fromCharCode(i + charCodeA)),
		R.chain(x => [x, x]),
		L.shuffle,
		R.map((symbol: string) => ({ symbol, status: Cell.Status.Closed }))
	)() as Board;
};

// VIEW ======================================================

type BoardViewProps = {
	board: Board;
	onClickAt: (i: number) => void;
	size: {
		width: number;
		height: number;
	};
};
export const BoardView: React.FC<BoardViewProps> = ({
	board,
	onClickAt,
	size,
}) => {
	const gridLengthToString = (i: number): string => {
		let res = '';
		while (i > 0) {
			res += ' 1fr';
			i--;
		}
		return res;
	};

	return (
		<>
			<div className="board">
				{board.map((cell, i) => (
					<Cell.cellView
						key={i}
						cell={cell}
						onClick={() => onClickAt(i)}
					/>
				))}
			</div>
			<style jsx>{`
				.board {
					display: grid;
					grid-template-columns: ${gridLengthToString(size.width)};
					grid-template-rows: ${gridLengthToString(size.height)};
					min-width: 350px;
					min-height: 480px;
					gap: 2px;
					align-self: center;
				}
			`}</style>
		</>
	);
};

type ScreenViewProps = {
	background: string;
};

export const ScreenView: React.FC<ScreenViewProps> = ({
	background,
	children,
}) => {
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
};
