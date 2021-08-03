import { Round } from './smallFunctions'

export const pullPoyas = (radiuses, errors, poyas) => {

	let result = { poyas: +poyas };

	const bareTemps = radiuses["bareTemps"]
	const section = radiuses[poyas]

	for (let luch in section) {
		let luchMeters = []

		////// формирование массива ошибок датчиков
		// на некоторых лучах датчики отсутствуют совсем - пропускаем
		if (luch in bareTemps[poyas]) {
			const meters = bareTemps[poyas][luch]

			luchMeters = Object.keys(meters).map(radius => {
				const meterError = errors && luch in errors && !errors[luch][Object.keys(errors[luch])[0]].nonActive
				const meterValue = Round(meters[radius])

				return {
					meterRadius: +radius,
					meterTemp: meterError ? `Подмена ${meterValue}` : meterValue,
					meterError
				}
			})
		}

		///// формирование массива изотерм
		result[luch] = section[luch].reduce((acc, curr) => {
			if (+curr.dT < 310)
				acc["value300"] = { radius: curr.dR, temp: curr.dT }
			else if (+curr.dT < 510)
				acc["value500"] = { radius: curr.dR, temp: curr.dT }
			else if (+curr.dT < 810)
				acc["value800"] = { radius: curr.dR, temp: curr.dT }
			else
				acc["value1150"] = { radius: curr.dR, temp: curr.dT }

			return acc
		}, {})

		result[luch]["meters"] = luchMeters
		result.hottestPoyas = radiuses.hottestPoyas
	}

	return result;
}
