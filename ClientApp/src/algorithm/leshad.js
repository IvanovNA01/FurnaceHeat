import { F_polugrafit, F_mullit, F_micropor78, Abs, Round } from './smallFunctions';


/////////////////////////////////////// LESHAD FUNCION
export const leshad = (poyasa) => {
	// структура результата работы функции
	poyasa["net1150"] = {}	// правая вертикальная часть сетки 1150

	// ОСНОВНОЙ РАСЧЕТ ДЛЯ ВСЕХ ЛУЧЕЙ
	for (let luch = 1; luch < 33; ++luch) {

		// ПРАВАЯ сторона =1668 мм
		const rightResult = rightSide(poyasa, luch);

		poyasa.net1150[luch] = [
			{ dR: 3518, dH: rightResult.vysoty["3518"][0]["dH"], dT: 300 },
			{ dR: 3518, dH: rightResult.vysoty["3518"][1]["dH"], dT: 500 },
			{ dR: 3518, dH: rightResult.vysoty["3518"][2]["dH"], dT: 800 },
			{ dR: 3518, dH: rightResult.vysoty["3518"][3]["dH"], dT: 1150 },
			{ dR: 1668, dH: rightResult.vysoty["1668"][0]["dH"], dT: 300 },
			{ dR: 1668, dH: rightResult.vysoty["1668"][1]["dH"], dT: 500 },
			{ dR: 1668, dH: rightResult.vysoty["1668"][2]["dH"], dT: 800 },
			{ dR: 1668, dH: rightResult.vysoty["1668"][3]["dH"], dT: 1150 },
			{ dR: 0, dH: rightResult.vysoty["0"][0]["dH"], dT: 300 },
			{ dR: 0, dH: rightResult.vysoty["0"][1]["dH"], dT: 500 },
			{ dR: 0, dH: rightResult.vysoty["0"][2]["dH"], dT: 800 },
			{ dR: 0, dH: rightResult.vysoty["0"][3]["dH"], dT: 1150 },
		]
	}

	return poyasa;
}


//////////////////////////////////// (ПРАВАЯ сторона прямоугольной области)
const rightSide = (poyasa, luch) => {
	const result = { vysoty: {} };

	const h1 = 1300;	// высота первого уровня датчиков (пояс 1)
	const h2 = 2400;	// высота второго уровня датчиков (пояс 3)

	// берем самый ближний к центру радиус = r0
	const radiuses13 = Object.keys(poyasa[3][1]).slice(0, 1);

	radiuses13.forEach(radius => {
		const t1 = poyasa[1][luch][radius];														// температура на 1 поясе
		const t3 = poyasa[3][luch][radius];														// температура на 3 поясе
		const C = (F_polugrafit(t3) - F_polugrafit(t1)) / (h2 - h1)

		// расчет распределения температур по высоте в лещади
		const dt = 0.1;
		let t = t1;
		let h = h1;

		while (t < 1150.1) {
			let Integral = h < h2
				? F_polugrafit(t + dt) - F_polugrafit(t)
				: h < 2950
					? F_micropor78(t + dt) - F_micropor78(t)
					: F_mullit(t + dt) - F_mullit(t)

			if (Abs(t - 300) < 0.05 || Abs(t - 500) < 0.05 || Abs(t - 800) < 0.05 || Abs(t - 1150) < 0.05) {
				if (!result.vysoty[radius])
					result.vysoty[radius] = [];
				// доделка для большей плавности
				const point = Round(t) === 800
					? ({ dT: Round(t), dH: Round(h * 0.97) })
					: ({ dT: Round(t), dH: Round(h) })

				result.vysoty[radius].push(point);
			}

			h += (Integral / C);
			t += dt;
		}
	})
	//сглаживание
	result.vysoty["1668"] = []
	result.vysoty["3518"] = []
	result.vysoty["0"].forEach(pt => {
		const point1668 = pt.dT === 300
			? ({ dT: pt.dT, dH: Round(pt.dH * 1.12) })
			: ({ dT: pt.dT, dH: Round(pt.dH * 1.005) })

		const point3518 = pt.dT === 300
			? ({ dT: pt.dT, dH: Round(point1668.dH * 1.12) })
			: pt.dT === 800
				? ({ dT: pt.dT, dH: Round(point1668.dH * 1.03) })
				: ({ dT: pt.dT, dH: Round(point1668.dH * 1.01) })

		result.vysoty["1668"].push(point1668)
		result.vysoty["3518"].push(point3518)
	})

	return result;
}
