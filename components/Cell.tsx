import React from 'react';

// LOGIC ====================================================
// cell = {
// 		symbol: "A",
// 		status: Status.Open
//}

export enum Status {
	Open,
	Closed,
	Done,
	Failed,
}

export type Cell = {
	symbol: string;
	status: Status;
};

export type PredFn = (cell: Cell) => boolean;

export const isOpen = (cell: Cell): boolean => cell.status == Status.Open;

export const isClosed = (cell: Cell): boolean => cell.status == Status.Closed;

export const isDone = (cell: Cell): boolean => cell.status == Status.Done;

export const isFailed = (cell: Cell): boolean => cell.status == Status.Failed;

export const isBlocking = (cell: Cell): boolean =>
	isOpen(cell) || isFailed(cell);

// VIEW ====================================================

type cellViewProps = {
	cell: Cell;
	onClick: (event: React.MouseEvent) => void;
};

export const cellView: React.FC<cellViewProps> = ({ cell, onClick }) => {
	let { status, symbol } = cell;
	return (
		<div className={'cell'} onClick={onClick}>
			{status == Status.Closed ? '' : symbol}
			<style jsx>{`
				.cell {
					font-size: 4rem;
					background: gray;
					display: flex;
					align-items: center;
					justify-content: center;
					/* min-height: 68px; */
					background: ${statusToBackground(status)};
					cursor: ${status == Status.Closed ? 'pointer' : 'auto'};
				}
			`}</style>
		</div>
	);
};

function statusToBackground(status: Status) {
	switch (status) {
		case Status.Closed:
			return 'darkgray';
		case Status.Open:
			return '#dcdcdc';
		case Status.Done:
			return '#a8db8f';
		case Status.Failed:
			return '#db8f8f';
	}
}
