import { pullFromCache, pushToCache } from './CacheHandlers'
import { DbHandler } from "./DbHandler"
import { showLoading } from "../../components/Layout/extra"
import { handleAbsentDates } from "./HistoryHandlers"
import { rKeram_80 } from "../../algorithm/gorn"
import { calculateBasicR1150, Log } from "../../algorithm/smallFunctions"
import { devideData } from "../../algorithm/devideData"
import { complementData } from "../../algorithm/complementData"


////////////////// the cache container
const fCache = {}
const db = new DbHandler()


/**
 * /////////// The function to handle heat flows
 * @param {number} poyas 
 * @param {Array} dates
 */
export const handleHeatFlow = async (poyas, dates) => {
	// try pulling data from cache
	const result = pullFromCache(dates, poyas, fCache)		// result structure is { [date]: {...}, [date2]: {...} }
	let remainingDates = result.reminingDates

	// if there's any non-cached date left
	if (remainingDates.length) {
		showLoading()

		const begin = remainingDates[0]
		const end = remainingDates[remainingDates.length - 1]
		try {
			const pullData = await db.pullHeatFlowDataAsync(begin, end, poyas)

			const handledData = await handleServerData(pullData, +poyas)

			const completeData = calculateHeatFlows(handledData, poyas)
			pushToCache(completeData, poyas, fCache)

			result.data = Object.keys(completeData).reduce((acc, date) => {
				remainingDates.includes(date) && (acc[date] = completeData[date])
				return acc
			}, {})
		}
		catch (error) {
			if (!error.message.includes("redundant") && !error.message.includes("abort"))
				window.alert(error.message)
			return null
		}
	}

	return makeChartData(result.data)
}



////////////////// warms up server data for further handling
const handleServerData = async (pullData, initialPoyas) => {
	const completeSensors = {}

	// t1150 consistency check
	const pullDataSensorsKeys = Object.keys(pullData.sensors)
	const pullDataR1150Keys = Object.keys(pullData.r1150)

	if (pullDataSensorsKeys.length !== pullDataR1150Keys.length) {
		const datesToCount = pullDataSensorsKeys.reduce((accDt, dt) => {
			pullDataR1150Keys.indexOf(dt) < 0 && accDt.push(dt)
			return accDt
		}, [])

		const requestPoyas = initialPoyas > 0 && initialPoyas < 13 ? "" + initialPoyas : "0"
		const calculatedR1150s = await handleAbsentDates(datesToCount, requestPoyas)
		pullData.r1150 = { ...pullData.r1150, ...calculatedR1150s }
	}

	// append virtual sensors
	pullDataSensorsKeys.forEach(date => {
		const devidedSensors = devideData(pullData.sensors[date])

		// substitute failed sensors values
		Object.keys(devidedSensors).forEach(poyas => {
			Object.keys(devidedSensors[poyas]).forEach(luch => {
				Object.keys(devidedSensors[poyas][luch]).forEach(radius => {
					const sensorTemp = devidedSensors[poyas][luch][radius]
					if (sensorTemp > 1200) {
						devidedSensors[poyas][luch][radius] = findValidSensor(devidedSensors[poyas], luch, radius)
					}
				})
			})
		})

		completeSensors[date] = complementData(devidedSensors)
	})

	// get rid of bareTemps and poyas extra layer
	const cleanData = Object.keys(completeSensors).reduce((acc, date) => {
		const poyas = Object.keys(completeSensors[date])[0]
		const luchi = completeSensors[date][poyas]

		// append r1150 value to each luch
		const poyasData = Object.keys(luchi).reduce((acc2, luch) => {
			let r1150 = pullData.r1150[date][luch - 1]["r1150"]

			switch (initialPoyas) {
				case 0: break
				case 1668: r1150 *= 1.005; break
				case 3518: r1150 = 4050; break
				default: break
			}

			acc2[luch] = { ...luchi[luch], r1150 }
			return acc2
		}, {})

		acc[date] = poyasData
		return acc
	}, {})

	return cleanData
}



///////////// failured sensor value substitution
const findValidSensor = (poyas, luch, radius) => {
	const stapleArea = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28]
	const shortArea = [29, 30, 31, 32, 1, 2, 3, 4, 5,]

	const interval = shortArea.includes(+luch) ? shortArea : stapleArea
	let delta = 1

	while (+delta < interval.length) {
		const forward = interval.includes(+luch + delta) && (+luch + delta) + '' in poyas ? +luch + delta : null
		if (forward && poyas[forward][radius] < 1200)
			return poyas[forward][radius]

		const backward = interval.includes(luch - delta) && (+luch - delta) + '' in poyas ? luch - delta : null
		if (backward && poyas[backward][radius] < 1200)
			return poyas[backward][radius]

		++delta
	}
}



///////////// business logic - calculates heat flows
const calculateHeatFlows = (data, initialPoyas) => {
	const result = Object.keys(data).reduce((acc, date) => {
		const currentDate = data[date]

		// disassemble date set and calculate Q
		const flows = Object.keys(currentDate).reduce((acc2, luch) => {
			const point = currentDate[luch]

			const radius = initialPoyas > 5 && initialPoyas < 13
				? Object.keys(point)[0]
				: initialPoyas

			const tSensor = point[radius]
			const r1150 = point.r1150

			let Q
			if (initialPoyas === "0" || initialPoyas === "1668" || initialPoyas === "3518") {
				// condition for belts
				Q = r1150 > 2950
					? (1150 - tSensor) * 514.754402 / (((r1150 - 2950) / 2.28) + ((2950 - 2400) / 10.9) + ((2400 - 1300) / 10))
					: r1150 > 2400
						? (1150 - tSensor) * 514.754402 / (((2950 - 2400) / 10.9) + ((2400 - 1300) / 10))
						: (1150 - tSensor) * 514.754402 / ((2400 - 1300) / 10)
			}
			else {
				const basicR1150 = calculateBasicR1150(+initialPoyas, +luch)
				const rKeram80 = rKeram_80(initialPoyas, luch, basicR1150)

				if ((+initialPoyas === 8 || +initialPoyas === 9) && (+luch === 3 || +luch === 31))
					Q = (1150 - tSensor) * 1.011806 / Log(radius / r1150)
				else {
					Q = r1150 < rKeram80
						? (1150 - tSensor) * 0.092826 / (Log(rKeram80 / r1150) * (1 / 5) + Log(radius / rKeram80) * (1 / 10.9))
						: (1150 - tSensor) * 1.011806 / Log(radius / r1150)
				}
			}
			acc2[luch] = Math.round(Q * 100) / 100
			return acc2
		}, {})

		acc[date] = flows
		return acc
	}, {})

	return result
}



/////////////////////// rearranging result for chart
const makeChartData = (datesData) => {
	let chartResult = []
	Object.keys(datesData).forEach(date => {
		const chartPoint = { date }

		Object.keys(datesData[date]).forEach(luch => {
			const valueToDisplay = datesData[date][luch]
			chartPoint[`Луч ${luch}`] = valueToDisplay < 0 ? 0 : valueToDisplay
		})

		chartResult.push(chartPoint)
	})
	chartResult.sort((a, b) => (a.date > b.date) ? 1 : ((b.date > a.date) ? -1 : 0))

	return chartResult
}
