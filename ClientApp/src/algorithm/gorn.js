import { razgarCalcRoot } from './razgarCalcRoot';
import { Exp, Log, Abs, Round, F_micropor78, F_keram80, equation, calculateBasicR1150 } from './smallFunctions';


////////////////////////////////////////////// GORN FUNCTION
export const gorn = (basicPoyasa, poyasa) => {
	let result = { 6: poyasa.poyas6 };

	const t1150 = 1150;

	for (let luch = 1; luch < 33; ++luch) {
		for (let poyas = 3; poyas < 13; ++poyas) {
			const r0 = Math.max(...Object.keys(basicPoyasa[poyas][luch]));
			const t0 = basicPoyasa[poyas][luch][r0];	 // первая начальная опорная точка

			const basicR1150 = calculateBasicR1150(poyas, luch)

			// определение долей разных слоев футеровки
			const rKeram80 = rKeram_80(poyas, luch, basicR1150)

			///// расчет корней - значений температуры во второй начальной опорной точке
			let t1 = 0;	// вторая начальная опорная точка

			if ((luch === 3 || luch === 31) && (poyas === 8 || poyas === 9)) {
				const C0 = (F_keram80(t1150) - F_keram80(t0)) / (Log(Abs(basicR1150)) - Log(Abs(r0)));
				t1 = equation(C0, r0, t0);
			}
			else {
				const K1 = Log(Abs(rKeram80)) - Log(Abs(r0));
				const K2 = Log(Abs(basicR1150)) - Log(Abs(rKeram80));
				const t_keram_80 = razgarCalcRoot(
					K2 * 0.0029 + K1 * 0.000045,
					K2 * 8 + K1 * 5,
					-K2 * F_micropor78(t0) - K1 * F_keram80(t1150),
					t0
				);

				// начальный коэффициент распреденения теплового потока
				const C0 = (F_micropor78(t_keram_80) - F_micropor78(t0)) / K1

				t1 = razgarCalcRoot(
					0.0029,
					8,
					C0 * (Log(r0) - Log(r0 - 100)) - F_micropor78(t0),
					t0
				);
			}

			///// расчет корней - значений температуры во второй текущей опорной точке
			const currentT0 = poyasa[poyas][luch][r0];	// первая опорная точка за текущую дату
			const currentT1 = currentT0 * t1 / t0				// вторая опорная точка за текущую дату


			/////////// PUT VALUE TO THE STORES
			basicPoyasa[poyas][luch][r0 - 100] = t1;
			poyasa[poyas][luch][r0 - 100] = currentT1;


			// текущий коэффициент распреденения теплового потока
			const C = ((luch === 3 || luch === 31) && (poyas === 8 || poyas === 9))
				? (F_keram80(currentT1) - F_keram80(currentT0)) / (Log(r0 - 100) - Log(r0))
				: (F_micropor78(currentT1) - F_micropor78(currentT0)) / (Log(r0 - 100) - Log(r0))

			///// расчет текущего радиуса разгара
			const A = (r0 - basicR1150) / (1150 - t0)
			const B = basicR1150 - t0 * A
			const currentR1150 = A * currentT0 + B

			/////////// APPROXIMATION
			let r = r0;
			let t = currentT0 + 1;

			while (t < 1151) {
				if (Math.abs(t - 300) <= 0.5 || Math.abs(t - 500) <= 0.5 || Math.abs(t - 800) <= 0.5 || Math.abs(t - 1150) <= 0.5) {
					if (!result[poyas])
						result[poyas] = {};

					if (!result[poyas][luch])
						result[poyas][luch] = [];

					const point = Math.abs(t - 1150) <= 0.5
						? { dT: Round(t), dR: Round(currentR1150) }
						: { dT: Round(t), dR: Round(r) }

					let skipPoint = false		// флаг пропуска точек изотерм выше 300 градусов на поясах ниже 5

					///// обработка поясов ниже 6-го
					if (poyas < 6) {
						if (point.dT < 310) {
							switch (poyas) {
								case 3: point.dR -= 2000; break
								case 4: luch >= 1 && luch <= 8
									? point.dR -= 800
									: point.dR -= 500; break
								case 5: luch >= 1 && luch <= 8 ? point.dR -= 420 : point.dR -= 300; break
								default: break
							}
						}
						else if (point.dT < 510) {
							switch (poyas) {
								case 5: luch >= 1 && luch <= 8 ? point.dR -= 700 : point.dR -= 600; break
								default: skipPoint = true; break
							}
						}
						else if (point.dT < 810) {
							switch (poyas) {
								case 5: point.dR -= 900; break
								default: skipPoint = true; break
							}
						}
						else if (point.dT > 1000)	//// убираем ошибочную изотерму 1150
							skipPoint = true
					}

					!skipPoint && result[poyas][luch].push(point);
				}
				///// ВЫЧИСЛЕНИЯ РЕАЛЬНОГО РАДИУСА1150
				r = r <= basicR1150
					? 0.99999 * r
					: r >= rKeram80
						? currentR1150 < rKeram80
							? r - (r0 + 1.7 * rKeram80 - 2.7 * currentR1150) / 1150
							: r - (r0 - currentR1150) / 1150
						: r - (r0 + 1.7 * rKeram80 - 2.7 * currentR1150) / 3105

				++t;
			}

			//////////// CHECK DATA CONSISTENCY
			if (result[poyas][luch][0].dT !== 300) {
				let lackingPoints = []

				r = r0
				t = currentT0
				while (t > 299) {
					r *= 0.99995 / Exp((F_micropor78(t) - F_micropor78(t - 1)) / C)

					if (Math.abs(t - 800) <= 0.5) {
						lackingPoints = [{ dR: Round(r), dT: 800 }, ...lackingPoints]
					}

					if (Math.abs(t - 500) <= 0.5) {
						lackingPoints = [{ dR: Round(r), dT: 500 }, ...lackingPoints]
					}

					--t
				}

				lackingPoints = [{ dR: Round(r), dT: 300 }, ...lackingPoints]
				result[poyas][luch].push(...lackingPoints)
			}


		}
	}

	result.bareTemps = poyasa.bareTemps
	result.hottestPoyas = hottestPoyas(poyasa)
	result.hottestLuch = hottestLuch(poyasa)

	return result;
}




///////////////// определение долей разных слоев футеровки
export const rKeram_80 = (poyas, luch, basicR1150) => {
	if (+luch > 5 && +luch < 29)
		switch (+poyas) {
			case 6: return 4214
			case 7: return 4314
			default: return 4410
		}
	else
		switch (+poyas) {
			case 6: return 4214
			case 7: return 4210
			case 8: return (+luch === 3 || +luch === 31) ? basicR1150 : 4210
			case 9: return (+luch === 3 || +luch === 31) ? basicR1150 : 4210
			case 10: case 11: return 4210
			case 12: return 4410
			default: return 4410
		}
}



//////////////// определение наиболее жаркого пояса
const hottestPoyas = (poyasa) => {
	let hottestPoyas = 0
	let maxPoyasTemp = 0
	Object.keys(poyasa.complementedBareTemps).forEach(poyas => {
		if (isNaN(poyas))
			return

		let currentPoyasTemp = 0
		let metersCount = 0
		Object.keys(poyasa.complementedBareTemps[poyas]).forEach(luch => {
			const point = poyasa.complementedBareTemps[poyas][luch]
			Object.keys(point).forEach(radius => {
				currentPoyasTemp += point[radius]
				++metersCount
			})
		})
		currentPoyasTemp /= metersCount
		if (currentPoyasTemp > maxPoyasTemp) {
			hottestPoyas = poyas
			maxPoyasTemp = currentPoyasTemp
		}
	})
	return +hottestPoyas
}


//////////////// определение наиболее жаркого луча
const hottestLuch = (poyasa) => {
	let luchi = {}

	Object.keys(poyasa.complementedBareTemps).forEach(poyas => {
		if (isNaN(poyas))
			return

		Object.keys(poyasa.complementedBareTemps[poyas]).forEach(luch => {

			if (!luchi[luch])
				luchi[luch] = 0

			const point = poyasa.complementedBareTemps[poyas][luch]
			let radiusCounter = 0
			let totalPointTemp = 0
			Object.keys(point).forEach(radius => {
				totalPointTemp += point[radius]
				++radiusCounter
			})
			luchi[luch] += (totalPointTemp / radiusCounter)
		})
	})

	let maxTempLuch = 0
	let maxTemp = 0
	Object.keys(luchi).forEach(luch => {
		if (luchi[luch] > maxTemp) {
			maxTemp = luchi[luch]
			maxTempLuch = luch
		}
	})

	return +maxTempLuch
}