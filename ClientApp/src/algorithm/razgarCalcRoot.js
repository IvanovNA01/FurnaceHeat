import { Abs } from './smallFunctions';


//////// RAZGARCALCROOT
export const razgarCalcRoot = (...coefs) => {
	let result

	const [C0, C1, C2, t0] = coefs
	const Discrim = C1 ** 2 - 4 * C0 * C2

	if (Discrim === 0)
		result = -C1 / (2 * C0)
	else {
		const root0 = (-C1 + (Discrim ** 0.5)) / (2 * C0)
		const root1 = (-C1 - (Discrim ** 0.5)) / (2 * C0)

		result = Abs(root1 - t0 * 2) < Abs(root0 - t0 * 2)
			? root1
			: root0
	}

	return result
}
