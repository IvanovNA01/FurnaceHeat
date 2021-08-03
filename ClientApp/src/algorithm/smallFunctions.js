
export const Exp = Math.exp;

export const Log = Math.log;

export const Abs = Math.abs;

export const Round = Math.round;

export const F_micropor78 = x => (0.0029 * (x ** 2) + 8 * x)

export const F_keram80 = x => (0.000045 * (x ** 2) + 5 * x)

export const F_polugrafit = x => (0.00305 * (x ** 2) + 9.05 * x)

export const F_mullit = x => (-0.0005 * (x ** 2) + 3.28 * x)

export const calculateBasicR1150 = (poyas, luch) => {
	let result

	switch (poyas) {
		case 6: result = (luch > 5 && luch < 29) ? 3527 : 3520; break;
		case 7: result = (luch > 4 && luch < 30) ? 3854 : 3750; break;
		default: result = (luch > 5 && luch < 29) || poyas === 12 ? 4065 : 3865;
	}

	return result
}



export const equation = (C0, r0, t0) => {
	// расчет корней квадратного уравнения типа Аx^2+Bx+C=0   =>   D=B^2-4AC   =>   x1,2=(-В(+;-)D^0.5)/2A
	let A = 0.000045;
	let B = 5;
	let C = -C0 * (Log(r0 - 100) - Log(r0)) - F_keram80(t0);
	let D = (B ** 2) - 4 * A * C;

	let x1 = (-B + (D ** 0.5)) / (2 * A);
	let x2 = (-B - (D ** 0.5)) / (2 * A);

	// выбор положительного корня значения температуры
	const root = Abs(x1 - t0 * 2) > Abs(x2 - t0 * 2)
		? x2
		: x1

	return root;
}