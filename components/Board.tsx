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
	return openSymbols.length >= 2 && equalSymbols(openSymbols);
};

export const areOpensDifferent = (board: Board): boolean => {
	const openSymbols = getSymbolsBy(Cell.isOpen)(board);	
	return openSymbols.length >= 2 && !equalSymbols(openSymbols);
};

function equalSymbols(symbols: Array<string>) : boolean {
	const firstCode = symbols[0].codePointAt(0);
	const secondCode = symbols[1].codePointAt(0);

	if (firstCode === undefined || secondCode === undefined) {
		return false;
	}

	return parseInt(firstCode.toString(16), 16) === parseInt(secondCode.toString(16), 16) ? true : false;
}

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
