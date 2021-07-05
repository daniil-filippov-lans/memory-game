import React, { useState, useEffect, FormEvent } from 'react';
import * as Cell from './Cell';
import * as Board from './Board';
import * as R from 'rambda';
import {
	Director,
	WordBuilder,
	EmojiBuilder,
	GameBoard,
	size,
} from '../lib/builder';

// LOGIC =======================================================

export enum Status {
	Stopped,
	Running,
	Won,
	Lost,
	Settings,
}

export type State = {
	secondsLeft: number;
	status: Status;
	boardConfig: GameBoard;
	settings: configuration;
};

const openCell =
	(i: number) =>
	(state: State): State => ({
		...state,
		boardConfig: {
			...state.boardConfig,
			board: Board.setStatusAt(i)(Cell.Status.Open)(
				state.boardConfig.board
			),
		},
	});

const canOpenCell =
	(i: number) =>
	(state: State): boolean =>
		Board.canOpenAt(i)(state.boardConfig.board);

const succeedStep = (state: State): State => ({
	...state,
	boardConfig: {
		...state.boardConfig,
		board: Board.setStatusesBy(Cell.isOpen)(Cell.Status.Done)(
			state.boardConfig.board
		),
	},
});

const failStep1 = (state: State): State => ({
	...state,
	boardConfig: {
		...state.boardConfig,
		board: Board.setStatusesBy(Cell.isOpen)(Cell.Status.Failed)(
			state.boardConfig.board
		),
	},
});

const failStep2 = (state: State): State => ({
	...state,
	boardConfig: {
		...state.boardConfig,
		board: Board.setStatusesBy(Cell.isFailed)(Cell.Status.Closed)(
			state.boardConfig.board
		),
	},
});

const hasWinningCond = (state: State): boolean =>
	R.filter(Cell.isDone, state.boardConfig.board).length ==
	state.boardConfig.board.length;

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
	//Начальные настройки
	let builder: WordBuilder | EmojiBuilder = new WordBuilder();
	let director: Director = new Director(builder);
	let boardConf: GameBoard = director.createLowGameBoard();
	let settings: configuration = {complexity: 'easy', alphabet: 'word'};


	const [state, setState] = useState<State>({
		secondsLeft: 100,
		status: Status.Stopped,
		boardConfig: boardConf,
		settings
	});

	const { status, secondsLeft, boardConfig } = state;
	const { board } = state.boardConfig;

	const handleStartingClick = () => {
		if (status != Status.Running) {
			setState({
				...state,
				secondsLeft: 100,
				status: Status.Running,
			});
		}
	};

	const handleRunningClick = (i: number) => {
		if (status == Status.Running && canOpenCell(i)(state)) {
			setState(openCell(i));
		}
	};

	const handleSettingsClick = () => {
		if (status != Status.Settings) {
			setState(prev => ({ ...prev, status: Status.Settings}));
		}
	};

	const handleExitClick = () => applySettings(state.settings);

	const applySettings = (configuration: configuration) => {
		switch (configuration.alphabet) {
			case 'emoji':
				builder = new EmojiBuilder();
				break;
			case 'word':
				builder = new WordBuilder();
				break;
		}

		director.setBuilder(builder);

		switch (configuration.complexity) {
			case 'easy':
				boardConf = director.createLowGameBoard();
				break;
			case 'medium':
				boardConf = director.createMedGameBoard();
				break;
			case 'hard':
				boardConf = director.createHighGameBoard();
				break;
		}

		setState({
			secondsLeft: 100,
			status: Status.Stopped,
			boardConfig: boardConf,
			settings: configuration
		});
	}

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
			<StatusLineView status={status} secondsLeft={secondsLeft} exitHandler={handleExitClick}/>
			<ScreenBoxView
				status={status}
				boardConfig={boardConfig}
				onClickAt={handleRunningClick}
				onSettings={handleSettingsClick}
				applySettings={applySettings}
			/>
		</div>
	);
};

type StatusLineProps = {
	status: Status;
	secondsLeft: number;
	exitHandler: () => void;
};

const StatusLineView: React.FC<StatusLineProps> = ({ status, secondsLeft, exitHandler }) => {
	return (
		<>
			<div className="status-line">
				{status == Status.Running && <button onClick={exitHandler}>❌</button>}
				<div>Открывай карточки&nbsp;🐰</div>
				<div className="seconds">
					{status == Status.Running && `Секунды: ${secondsLeft}`}
				</div>
			</div>
			<style jsx>
				{`
					.status-line {
						color: gray;
						display: flex;
						padding-bottom: 10px;
						font-size: 1.5rem;
					}
					.status-line button {
						background: none;
						padding: 0;
						margin-right: 5px;
					}
					.seconds {
						margin-left: auto;
					}
				`}
			</style>
		</>
	);
};

type ScreenBoxViewProps = {
	status: Status;
	onClickAt: (i: number) => void;
	boardConfig: GameBoard;
	onSettings: () => void;
	applySettings: (configuration: configuration) => void;
};

const ScreenBoxView: React.FC<ScreenBoxViewProps> = ({
	status,
	onClickAt,
	boardConfig,
	onSettings,
	applySettings
}) => {
	switch (status) {
		case Status.Running:
			return (
				<Board.BoardView
					board={boardConfig.board}
					size={boardConfig.size}
					onClickAt={onClickAt}
				/>
			);

		case Status.Stopped:
			return (
				<Board.ScreenView background={statusToBackground(status)}>
					<div className="screen">
						<h1 style={{ paddingLeft: 32 }}>
							Игра на запоминание&nbsp;🐶
						</h1>
						<p className="medium" style={{ textAlign: 'center' }}>
							Сыграем&nbsp;⚽&nbsp;🥅!
						</p>
					</div>
					<ButtonSettings onSettings={onSettings} />
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

		case Status.Settings:
			return (
				<Board.ScreenView background={statusToBackground(status)}>
					<SettingsScreen applySettings={applySettings}/>
				</Board.ScreenView>
			);
	}
};

type IButtonSettingsProps = { onSettings: () => void };

const ButtonSettings: React.FC<IButtonSettingsProps> = ({ onSettings }) => {
	return (
		<>
			<button
				className="settingsButton"
				onClick={e => {
					e.stopPropagation();
					onSettings();
				}}
			>
				🛠️
			</button>
			<style jsx>{`
				.settingsButton {
					background: none;
					position: absolute;
					top: 40px;
					font-size: 2rem;
					right: 0px;
					padding: 20px;
				}
			`}</style>
		</>
	);
};

function statusToBackground(status: Status): string {
	switch (status) {
		case Status.Won:
			return '#a8db8f';
		case Status.Lost:
			return '#db8f8f';
		case Status.Settings:
			return '#ffc82d';
		default:
			return '#dcdcdc';
	}
}

type SettingsScreenProps = {
	applySettings: (configuration: configuration) => void;
};


type configuration = {
	complexity: string;
	alphabet: string;
};

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ applySettings }) => {
	const [configuration, setConfiguration] = useState<configuration>({complexity: 'easy', alphabet: 'word'});

	const setComplexity = (complexity: string) => {
		setConfiguration({
			...configuration,
			complexity,
		} as configuration);
	};

	const setAlphabet = (alphabet: string) => {
		setConfiguration({
			...configuration,
			alphabet,
		} as configuration);
	};

	const handleSubmit = (e: FormEvent) => {
		e.preventDefault();
		applySettings(configuration);
	}

	return (
		<>
			<div className="settings" onClick={(e) => e.stopPropagation()}>
				<form onSubmit={(e) => handleSubmit(e)} name="form">
					<p>Уровень сложности</p>
					<select name="complexity" id="complexity" onChange={(e) => setComplexity(e.target.value)}>
						<option value="easy">Легкий</option>
						<option value="medium">Средний</option>
						<option value="hard">Тяжелый</option>
					</select>
					<p>Элементы</p>
					<select name="alphabet" id="alphabet" onChange={(e) => setAlphabet(e.target.value)}>
						<option value="word">Буквы</option>
						<option value="emoji">Эмодзи</option>
					</select>
					<button type="submit">Принять</button>
				</form>
			</div>
			<style jsx>{`
				.settings {
					width: 360px;
					height: 480px;
					position: relative;
				}
				.settings * {
					margin: 0;
					padding: 0;
				}
				.settings form {
					width: 100%;
					position: absolute;
					top: 50%;
					display: flex;
					flex-direction: column;
					padding: 10px;
					transform: translateY(-50%);
				}
				.settings p {
					margin-bottom: 5px;
					padding-left: 5px;
					font-weight: bold;
				}
				.settings select {
					height: 30px;
					border: none;
					margin-bottom: 10px;
					outline: none;
					border-radius: 5px;
					padding-left: 5px;
				} 
				.settings button {
					font-size: 16px;
					margin-top: 20px;
					width: 40%;
					height: 30px;
					align-self: center;
					border-radius: 5px;
				}
			`}</style>
		</>
	);
};

export default GameView;
