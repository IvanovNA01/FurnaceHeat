
export const complementData = data => {
	const bareTemps = {}
	Object.keys(data).forEach(poyas => {
		if (poyas !== "errors") {
			bareTemps[poyas] = {}

			Object.keys(data[poyas]).forEach(luch => {
				bareTemps[poyas][luch] = {}

				Object.keys(data[poyas][luch]).forEach(radius => {
					bareTemps[poyas][luch][radius] = data[poyas][luch][radius]
				})
			})
		}
	})

	data["bareTemps"] = bareTemps ////// copy of initial meters temp

	////////// ПОЯСА 9-12
	const complement9_12 = (poyas) => {
		const datchRadius = Object.keys(data[poyas][1])[0];

		for (let luch = 2; luch <= 32; luch += 2) {
			data[poyas][luch] = {};

			luch !== 32
				? data[poyas][luch][datchRadius] = (data[poyas][luch - 1][datchRadius] + data[poyas][luch + 1][datchRadius]) / 2
				: data[poyas][luch][datchRadius] = (data[poyas][luch - 1][datchRadius] + data[poyas][1][datchRadius]) / 2
		}
	}

	"9" in data && complement9_12(9)
	"10" in data && complement9_12(10)
	"11" in data && complement9_12(11)
	"12" in data && complement9_12(12)


	///////// ПОЯС 1, 3 ЧЕТВЕРТЫЕ РАДИУСЫ
	for (let luch = 1; luch <= 32; ++luch) {
		if ("1" in data) {
			if (!data[1][luch])
				data[1][luch] = {};

			data[1][luch][0] = data[1][10][0];
		}

		if ("3" in data) {
			if (!data[3][luch])
				data[3][luch] = {};

			data[3][luch][0] = data[3][24][0];
		}
	}

	///////// ПОЯС 1, 3 РАДИУСЫ 2, 3
	const complement13 = poyas => {
		// ПЕРВЫЙ ПРОХОД - 3,7,11,15,19,23,27,31 ЛУЧИ
		for (let luch = 3; luch < 32; luch += 4) {
			if (!data[poyas][luch])
				data[poyas][luch] = {};

			if (luch !== 31) {
				data[poyas][luch][1668] = (data[poyas][luch - 2][1668] + data[poyas][luch + 2][1668]) / 2;
				data[poyas][luch][3518] = (data[poyas][luch - 2][3518] + data[poyas][luch + 2][3518]) / 2;
			}

			else {
				data[poyas][luch][1668] = (data[poyas][luch - 2][1668] + data[poyas][1][1668]) / 2;
				data[poyas][luch][3518] = (data[poyas][luch - 2][3518] + data[poyas][1][3518]) / 2;
			}
		}

		// ВТОРОЙ ПРОХОД - ЧЕТНЫЕ ЛУЧИ
		for (let luch = 2; luch <= 32; luch += 2) {
			if (!data[poyas][luch])
				data[poyas][luch] = {};

			if (luch !== 32) {
				data[poyas][luch][1668] = (data[poyas][luch - 1][1668] + data[poyas][luch + 1][1668]) / 2;
				data[poyas][luch][3518] = (data[poyas][luch - 1][3518] + data[poyas][luch + 1][3518]) / 2;
			}

			else {
				data[poyas][luch][1668] = (data[poyas][luch - 1][1668] + data[poyas][1][1668]) / 2;
				data[poyas][luch][3518] = (data[poyas][luch - 1][3518] + data[poyas][1][3518]) / 2;
			}
		}
	}

	"1" in data && complement13(1)
	"3" in data && complement13(3)

	return data;
}