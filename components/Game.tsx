import React, { useState, useEffect } from 'react';
import * as Cell from './Cell';
import * as Board from './Board';
import * as R from 'rambda';

import { Director, WordBuilder, GameBoard } from '../lib/builder';

// LOGIC =======================================================

export enum Status {
	Stopped,
	Running,
	Won,
	Lost,
}

export type State = {
	secondsLeft: number;
	status: Status;
	gameConfig: GameBoard;
};

const wordBuilder = new WordBuilder();
const director = new Director(wordBuilder);

let gameConf = director.createHighGameBoard();

const startGame = (): State => ({
	status: Status.Running,
	secondsLeft: 100,
	gameConfig: gameConf,
});

const openCell =
	(i: number) =>
	(state: State): State => ({
		...state,
		gameConfig: { ...state.gameConfig, board: Board.setStatusAt(i)(Cell.Status.Open)(state.gameConfig.board)},
	});

const canOpenCell =
	(i: number) =>
	(state: State): boolean =>
		Board.canOpenAt(i)(state.gameConfig.board);

const succeedStep = (state: State): State => ({
	...state,
	gameConfig: {...state.gameConfig , board: Board.setStatusesBy(Cell.isOpen)(Cell.Status.Done)(state.gameConfig.board)},
});

const failStep1 = (state: State): State => ({
	...state,
	gameConfig: {...state.gameConfig, board: Board.setStatusesBy(Cell.isOpen)(Cell.Status.Failed)(state.gameConfig.board)},
});

const failStep2 = (state: State): State => ({
	...state,
	gameConfig: {...state.gameConfig, board: Board.setStatusesBy(Cell.isFailed)(Cell.Status.Closed)(state.gameConfig.board)},
});

const hasWinningCond = (state: State): boolean =>
	R.filter(Cell.isDone, state.gameConfig.board).length == state.gameConfig.board.length;

const hasLosingCond = (state: State): boolean => !state.secondsLeft;

const setStatus =
	(status: Status) =>
	(state: State): State => ({ ...state, status });

const nextSecond = (state: State): State => ({
	...state,
	secondsLeft: Math.max(state.secondsLeft - 1, 0),
});

// VIEW ===================================================

const GameView: React.FC = () => {
	
	const [state, setState] = useState<State>({
		...startGame(),
		status: Status.Stopped,
	});

	const { status, secondsLeft, gameConfig } = state;
	const { board } = state.gameConfig;

	const handleStartingClick = () => {
		if (status != Status.Running) {
			setState(startGame);
		}
	};

	const handleRunningClick = (i: number) => {
		if (status == Status.Running && canOpenCell(i)(state)) {
			setState(openCell(i));
		}
	};

	// Wining / Losing conditions
	useEffect(() => {
		if (state.status == Status.Running) {
			if (hasWinningCond(state)) {
				return setState(setStatus(Status.Won));
			} else if (hasLosingCond(state)) {
				return setState(setStatus(Status.Lost));
			}
		}
	}, [state]);

	// Board handling
	useEffect(() => {
		if (status == Status.Running) {
			if (Board.areOpensEqual(board)) {
				setState(succeedStep);
			} else if (Board.areOpensDifferent(board)) {
				setState(failStep1);
				setTimeout(() => {
					setState(failStep2);
				}, 500);
			}
		}
	}, [board, status]);

	// Timer handling
	useEffect(() => {
		let timer: ReturnType<typeof setInterval> | undefined = undefined;
		if (status == Status.Running && !timer) {
			timer = setInterval(() => {
				setState(nextSecond);
			}, 1000);
		}

		return () => {
			timer ? clearInterval(timer) : null;
		};
	}, [status]);

	return (
		<div className="container" onClick={handleStartingClick}>
			<StatusLineView status={status} secondsLeft={secondsLeft}/>
			<ScreenBoxView
				status={status}
				gameConfig={gameConfig}
				onClickAt={handleRunningClick}
			/>
		</div>
	);
};

type StatusLineProps = {
	status: Status;
	secondsLeft: number;
};

const StatusLineView: React.FC<StatusLineProps> = ({ status, secondsLeft }) => {
	return (
		<>
			<div className="status-line">
				<div>Открывай карточки&nbsp;🐰</div>
				<div>
					{status == Status.Running && `Секунды: ${secondsLeft}`}
				</div>
			</div>
			<style jsx>
				{`
					.status-line {
						color: gray;
						display: flex;
						padding-bottom: 10px;
						justify-content: space-between;
						font-size: 1.5rem;
					}
				`}
			</style>
		</>
	);
};

type ScreenBoxViewProps = {
	status: Status;
	onClickAt: (i: number) => void;
	gameConfig: GameBoard;
};

const ScreenBoxView: React.FC<ScreenBoxViewProps> = ({
	status,
	onClickAt,
	gameConfig,
}) => {
	switch (status) {
		case Status.Running:
			return (
				<Board.BoardView
					board={gameConfig.board}
					size={gameConfig.size}
					onClickAt={onClickAt}
				/>
			);

		case Status.Stopped:
			return (
				<Board.ScreenView background={statusToBackground(status)}>
					<div>
						<h1 style={{ paddingLeft: 32 }}>
							Игра на запоминание&nbsp;🐶
						</h1>
						<p className="medium" style={{ textAlign: 'center' }}>
							Сыграем&nbsp;⚽&nbsp;🥅!
						</p>
					</div>
				</Board.ScreenView>
			);
		case Status.Won:
			return (
				<Board.ScreenView background={statusToBackground(status)}>
					<div>
						<h1 style={{ paddingLeft: 32 }}>
							Ты мой чемпион&nbsp;💃!
						</h1>
						<p className="medium" style={{ textAlign: 'center' }}>
							Ещё разочек&nbsp;🎰&nbsp;🎰&nbsp;🎰?
						</p>
					</div>
				</Board.ScreenView>
			);

		case Status.Lost:
			return (
				<Board.ScreenView background={statusToBackground(status)}>
					<div>
						<h1 style={{ paddingLeft: 32 }}>
							Ты хорошо старался&nbsp;🧗!
						</h1>
						<p className="medium" style={{ textAlign: 'center' }}>
							Попробуй обыграй Биг Босса&nbsp;🐱‍👤
						</p>
					</div>
				</Board.ScreenView>
			);
	}
};

function statusToBackground(status: Status): string {
	switch (status) {
		case Status.Won:
			return '#a8db8f';
		case Status.Lost:
			return '#db8f8f';
		default:
			return '#dcdcdc';
	}
}

export default GameView;
