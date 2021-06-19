import React from 'react';

// LOGIC ====================================================
// cell = {
// 		symbol: "A",
// 		status: Status.Open
//}

export const Status = {
	Open: 'Open',
	Closed: 'Closed',
	Done: 'Done',
	Failed: 'Failed',
};

export const isOpen = cell => cell.status == Status.Open;

export const isClosed = cell => cell.status == Status.Closed;

export const isDone = cell => cell.status == Status.Done;

export const isFailed = cell => cell.status == Status.Failed;

export const isBlocking = cell => isOpen(cell) || isFailed(cell);

// VIEW ====================================================

export function View({ cell, onClick }) {
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
}

function statusToBackground(status) {
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
