import * as R from 'rambda';

export function allEquals(xs) {
	// Vacuous truth
	if (xs.length < 2) {
		return true;
	}

	const [head, tail] = xs;
	return R.all(R.equals(head), tail);
}

export const randomInt = R.curry((min, max) => {
	return Math.floor(Math.random() * (max - min)) + min;
});

export const swap = R.curry((i1, i2, xs) => {
	let v1 = xs[i1];
	let v2 = xs[i2];

	return R.pipe(R.update(i1, v2), R.update(i2, v1))(xs);
});

export const shuffle = xs => {
	let counter = xs.length;
	while (counter > 0) {
		let index = randomInt(0, counter);
		counter -= 1;
		xs = swap(index, counter, xs);
	}
	return xs;
};
