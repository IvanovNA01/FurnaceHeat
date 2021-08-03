

export class T1150History {
	static getList(radiuses, net1150, date) {
		const result = []

		Object.keys(radiuses).forEach(poyas => {
			if (!isNaN(poyas) && poyas > 5) {
				Object.keys(radiuses[poyas]).forEach(luch => {
					if (radiuses[poyas][luch].length < 4) {					// на тех радиусах, где нет изотермы 1150 пишем радиус -1
						result.push({
							date: date,
							poyas: +poyas,
							luch: +luch,
							r1150: -1
						})
					}
					else {																					// а там, где она есть пишем ее радиус
						const point1150 = radiuses[poyas][luch].filter(point => point.dT === 1150)[0]
						result.push({
							date: date,
							poyas: +poyas,
							luch: +luch,
							r1150: +point1150.dR,
						})
					}
				})
			}
		})

		Object.keys(net1150).forEach(luch => {
			const r3518 = net1150[luch][3]
			const r1668 = net1150[luch][7]
			const r0 = net1150[luch][11]

			result.push(
				{
					date: date,
					poyas: +r3518.dR,
					luch: +luch,
					r1150: +r3518.dH,
				},
				{
					date: date,
					poyas: +r1668.dR,
					luch: +luch,
					r1150: +r1668.dH,
				},
				{
					date: date,
					poyas: +r0.dR,
					luch: +luch,
					r1150: +r0.dH,
				},
			)
		})

		return result
	}

}