
const heights = {
	1: 1300,
	3: 2400,
	4: 2950,
	5: 3500,
	6: 4050,
	7: 4600,
	8: 5150,
	9: 5650,
	10: 6150,
	11: 6700,
	12: 7200
}


export const pullLuch = (radiuses, net1150, errors, luch) => {
	let result = {
		data: {
			300: [],
			500: [],
			800: [],
			1150: [],
		},
		luch: null,
	};
	///////////////////////////////////////////////////////////// добавляем точки на радиусах 0, 1668, 3518
	net1150.slice().reverse().forEach(curr => {
		curr.dT === 300
			? result.data["300"].push({ left300: curr.dR, top300: curr.dH })
			: curr.dT === 500
				? result.data["500"].push({ left500: curr.dR, top500: curr.dH })
				: curr.dT === 800
					? result.data["800"].push({ left800: curr.dR, top800: curr.dH })
					: result.data["1150"].push({ left1150: curr.dR, top1150: curr.dH })
	})

	/////////////////////////////////////////////////// точки поясов
	for (let poyas = 4; poyas < 13; ++poyas) {
		const sector = radiuses[poyas][luch]

		// extra fake point to smooth the line
		if (poyas === 5)
			result.data["500"].push({ left500: 4200, top500: heights[poyas], poyas: +poyas })

		// staple belts points
		sector.forEach(point => {
			if (point.dT < 310)
				result.data["300"].push({ left300: point["dR"], top300: heights[poyas], poyas: +poyas })
			else if (point.dT < 510 && poyas > 5)
				result.data["500"].push({ left500: point["dR"], top500: heights[poyas], poyas: +poyas })
			else if (point.dT < 810 && poyas > 5) {
				result.data["800"].push({ left800: point["dR"], top800: heights[poyas], poyas: +poyas })
			}
			else if (poyas > 5)
				if (poyas === 6)
					result.data["1150"].push({ left1150: point["dR"], top1150: heights[poyas], poyas: +poyas })
				else
					result.data["1150"].push({ left1150: point["dR"], top1150: heights[poyas], poyas: +poyas })
		})
	}

	//////////////////////////////////////////////////////////////// верхние точки графиков (дополнительные)
	result.data["1150"].push({ left1150: 4065, top1150: 8000 })
	result.data["800"].push({ left800: 4265, top800: 8000 })
	result.data["500"].push({ left500: 4465, top500: 8000 })
	result.data["300"].push({ left300: 4665, top300: 8000 })

	////////////////////////////// датчики
	result.data.meters = []

	Object.keys(radiuses.bareTemps).forEach(poyas => {
		radiuses.bareTemps[poyas][luch] &&
			Object.keys(radiuses.bareTemps[poyas][luch]).forEach(radius => {

				const error = errors
					&& poyas in errors
					&& luch in errors[poyas]
					&& !errors[poyas][luch][Object.keys(errors[poyas][luch])[0]].nonActive

				const value = Math.round(radiuses.bareTemps[poyas][luch][radius])

				result.data.meters.push({
					left: +radius,
					top: heights[poyas],
					value,
					error,
					color: error ? "red" : "palegreen"
				})
			})
	})
	result.luch = luch;
	result.hottestLuch = radiuses.hottestLuch
	return result;
}
