import React, { useState, useEffect } from 'react';
import * as Cell from './Cell';
import * as Board from './Board';
import * as R from 'rambda';

// LOGIC =======================================================

export enum Status {
	Stopped,
	Running,
	Won,
	Lost,
}

export type State = {
	board: Board.Board;
	secondsLeft: number;
	status: Status;
};

const size = { width: 6, height: 6 };
type sizeType = {
	width: number;
	height: number;
};

const startGame = (): State => ({
	board: Board.makeRandom(size.width, size.height),
	status: Status.Running,
	secondsLeft: 100,
});

const openCell =
	(i: number) =>
	(state: State): State => ({
		...state,
		board: Board.setStatusAt(i)(Cell.Status.Open)(state.board),
	});

const canOpenCell =
	(i: number) =>
	(state: State): boolean =>
		Board.canOpenAt(i)(state.board);

const succeedStep = (state: State): State => ({
	...state,
	board: Board.setStatusesBy(Cell.isOpen)(Cell.Status.Done)(state.board),
});

const failStep1 = (state: State): State => ({
	...state,
	board: Board.setStatusesBy(Cell.isOpen)(Cell.Status.Failed)(state.board),
});

const failStep2 = (state: State): State => ({
	...state,
	board: Board.setStatusesBy(Cell.isFailed)(Cell.Status.Closed)(state.board),
});

const hasWinningCond = (state: State): boolean =>
	R.filter(Cell.isDone, state.board).length == state.board.length;

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

	const { board, status, secondsLeft } = state;

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
			<StatusLineView status={status} secondsLeft={secondsLeft} />
			<ScreenBoxView
				status={status}
				board={board}
				size={size}
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
	board: Board.Board;
	onClickAt: (i: number) => void;
	size: sizeType;
};

const ScreenBoxView: React.FC<ScreenBoxViewProps> = ({
	status,
	board,
	onClickAt,
	size,
}) => {
	switch (status) {
		case Status.Running:
			return (
				<Board.BoardView
					board={board}
					size={size}
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