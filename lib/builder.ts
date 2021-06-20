// import { Board } from '../components/Board';
import * as R from 'rambda';
import * as L from '../lib/index';
import { Status } from '../components/Cell';
import { Board } from '../components/Board';

export type GameBoard = {
	board: Board;
	size: {
		width: number;
		height: number;
	};
};

interface Builder {
	setSize(width: number, height: number): void;
	setCells(): void;
	getBoard(): GameBoard;
}

export class EmojiBuilder implements Builder {
	private gameBoard: GameBoard;

	constructor() {
		this.reset();
	}
	public reset(): void {
		this.gameBoard = { board: [], size: { width: 0, height: 0 } };
	}

	setSize(width: number, height: number): void {
		this.gameBoard.size = {
			width,
			height,
		};
	}

	public getBoard(): GameBoard {
		const result = this.gameBoard;
		this.reset();
		return result;
	}
}

export class WordBuilder implements Builder {
	private gameBoard: GameBoard;

	constructor() {
		this.reset();
	}
	public reset(): void {
		this.gameBoard = { board: [], size: { width: 0, height: 0 } };
	}

	setSize(width: number, height: number): void {
		this.gameBoard.size = {
			width,
			height,
		};
	}

	setCells(): void {
		const { width: m, height: n } = this.gameBoard.size;
		const charCodeA = 'A'.charCodeAt(0);
		if ((m * n) / 2 > 26) throw new Error('too big');
		if ((m * n) % 2) throw new Error('must be even');

		this.gameBoard.board = R.pipe(
			() => R.range(0, (m * n) / 2), // ["A", "B", "C"]
			R.map((i: number) => String.fromCharCode(i + charCodeA)),
			R.chain(x => [x, x]),
			L.shuffle,
			R.map((symbol: string) => ({ symbol, status: Status.Closed }))
		)() as Board;
	}

	public getBoard(): GameBoard {
		const result = this.gameBoard;
		this.reset();
		return result;
	}
}

export class Director {
	private builder: Builder;

	public setBuilder(builder: Builder): void {
		this.builder = builder;
	}

	public buildGameBoard(width: number, height: number): void {
		this.builder.setSize(width, height);
		this.builder.setCells();
	}
}
