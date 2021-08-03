
export const devideData = data => {
	//// PARSING METERS VALUES FROM DATA
	let sensors = []

	// parse data from the string
	data.slice().forEach(d => {
		let parts = d.name.split(',')
			.map(split => split.trim())
			.map(item => item.split(' '))

		// cast each particle to a certain field
		sensors.push({
			poyas: +parts[1][1],
			radius: getRadius(+parts[1][1], parts[2][1], +parts[3][1]),
			luch: +parts[3][1],
			value: +d.value
		})
	});

	/* ////////////////// STRUCTURE
	poyasa {
		poyas
		poyas
		...
		poyas {
			luch
			luch
			...
			luch {
				radius { value }
				raduis { value }
			}
			...
			...
		}
		...
		...
	}
	*/

	////// WARMING UP RESULT
	let poyasa = {};                    // create main object (inside reduce function it is result)
	sensors.reduce((result, cur) => {    // accumulate values while iterating over the sensors array
		if (result[cur.poyas]) {
			if (result[cur.poyas][cur.luch])
				result[cur.poyas][cur.luch][cur.radius] = cur.value;  // 3. when we got all the structure - append a value for another radius

			else {                          // 2. when there is already at least one Luch presents there set inner object
				result[cur.poyas][cur.luch] = {};
				result[cur.poyas][cur.luch][cur.radius] = cur.value;
			}

		}
		else {                            // 1. when result is empty set initial framework objects
			let lu = {};
			lu[cur.luch] = {};
			lu[cur.luch][cur.radius] = cur.value;
			result[cur.poyas] = lu;
		}

		return result;
	}, poyasa);

	return poyasa;
}




const getRadius = (poyas, radius, luch) => {
	switch (poyas) {
		case 1:
			switch (radius) {
				case "2": return 3518;
				case "3": return 1668;
				case "4-1": return 0;
				case "4-2": return 1;
				default: return 0;
			}
		case 3:
			switch (radius) {
				case "1": return 4668;
				case "2": return 3518;
				case "3": return 1668;
				case "4-1": return 0;
				case "4-2": return 1;
				default: return 0;
			}
		case 4: case 5:
			switch (luch) {
				case 1: case 2: case 3: case 4: case 5: case 6: case 7: case 8: return 5568;
				default:
					if (poyas === 4)
						return 5168;

					return 5418;
			}
		case 6: case 7: return 5568;
		case 8: return 5486.5;
		case 9: return 5371;
		case 10: return 5255.5;
		case 11: return 5129;
		case 12: return 5013.5;
		default: throw new Error("devideData-getRadius: wrong poyas's been provided!");
	}
}