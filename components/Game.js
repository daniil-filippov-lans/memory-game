import React, { useState, useEffect } from 'react';
import * as Cell from './Cell';
import * as Board from './Board';
import * as R from 'rambda';

// LOGIC =======================================================

const Status = {
	Stopped: 'Stopped',
	Running: 'Running',
	Won: 'Won',
	Lost: 'Lost',
};

const startGame = state => ({
	board: Board.makeRandom(5, 6),
	status: Status.Running,
	secondsLeft: 100,
});

const openCell = R.curry((i, state) => ({
	...state,
	board: Board.setStatusAt(i, Cell.Status.Open, state.board),
}));

const canOpenCell = R.curry((i, state) => {
	return Board.canOpenAt(i, state.board);
});

const succeedStep = state => ({
	...state,
	board: Board.setStatusesBy(Cell.isOpen, Cell.Status.Done, state.board),
});

const failStep1 = state => ({
	...state,
	board: Board.setStatusesBy(Cell.isOpen, Cell.Status.Failed, state.board),
});

const failStep2 = state => ({
	...state,
	board: Board.setStatusesBy(Cell.isFailed, Cell.Status.Closed, state.board),
});

const hasWinningCond = state =>
	R.filter(Cell.isDone, state.board).length == state.board.length;

const hasLosingCond = state => !state.secondsLeft;

const setStatus = R.curry((status, state) => ({ ...state, status }));

const nextSecond = state => ({
	...state,
	secondsLeft: Math.max(state.secondsLeft - 1, 0),
});

// VIEW ===================================================

export default function View() {
	const [state, setState] = useState({
		...startGame(),
		status: Status.Stopped,
	});
	const { board, status, secondsLeft } = state;

	function handleStartingClick(i) {
		if (status != Status.Running) {
			setState(startGame);
		}
	}

	function handleRunningClick(i) {
		if (status == Status.Running && canOpenCell(i, state)) {
			setState(openCell(i));
		}
	}

	// Wining / Losing conditions
	useEffect(() => {
		if (status == Status.Running) {
			if (hasWinningCond(state)) {
				return setState(setStatus(Status.Won));
			} else if (hasLosingCond(state)) {
				return setState(setStatus(Status.Lost));
			}
		}
	}, [state]);

	// Board handling
	useEffect(() => {
		if (Board.areOpensEqual(board)) {
			setState(succeedStep);
		} else if (Board.areOpensDifferent(board)) {
			setState(failStep1);
			setTimeout(() => {
				setState(failStep2);
			}, 500);
		}
	}, [board]);

	// Timer handling
	useEffect(() => {
		let timer = null;
		if (status == Status.Running && !timer) {
			timer = setInterval(() => {
				setState(nextSecond);
			}, 1000);
		}

		return () => {
			clearInterval(timer);
		};
	}, [status]);

	return (
		<div className="container" onClick={handleStartingClick}>
			<StatusLineView status={status} secondsLeft={secondsLeft} />
			<ScreenBoxView
				status={status}
				board={board}
				onClickAt={handleRunningClick}
			/>
		</div>
	);
}

function StatusLineView({ status, secondsLeft }) {
	return (
		<div className="status-line">
			<div>Открывай карточки&nbsp;🐇</div>
			<div>{status == Status.Running && `Секунды: ${secondsLeft}`}</div>
		</div>
	);
}

function ScreenBoxView({ status, board, onClickAt }) {
	switch (status) {
		case Status.Running:
			return <Board.BoardView board={board} onClickAt={onClickAt} />;

		case Status.Stopped:
			return (
				<Board.ScreenView className="gray">
					<div>
						<h1>Игра на запоминание&nbsp;🐶</h1>
						<p className="medium" style={{ textAlign: 'center' }}>
							Нажми и сыграем&nbsp;⚽&nbsp;🥅!
						</p>
					</div>
				</Board.ScreenView>
			);
		case Status.Won:
			return (
				<Board.ScreenView className="green">
					<>
						<h1>Победа твоя&nbsp;🎮!</h1>
						<p className="medium" style={{ textAlign: 'center' }}>
							Сделаешь растяжку&nbsp;🧘?
						</p>
					</>
				</Board.ScreenView>
			);

		case Status.Lost:
			return (
				<Board.ScreenView className="red">
					<div>
						<h1 style={{ paddingLeft: 10 }}>
							Не сдавайся&nbsp;🤺!
						</h1>
						<p className="medium" style={{ textAlign: 'center' }}>
							Попробуй обыграй бигбосса&nbsp;🐱‍👤
						</p>
					</div>
				</Board.ScreenView>
			);
	}
}
