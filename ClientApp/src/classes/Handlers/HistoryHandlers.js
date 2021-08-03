import { gornChain } from '../chains'
import { T1150History } from '../Entities/T1150History'
import { pullFromCache, pushToCache } from './CacheHandlers'
import { Round } from "../../algorithm/smallFunctions"
import { DbHandler } from "./DbHandler"
import { showLoading } from "../../components/Layout/extra"
import moment from "moment"

////////////////// the cache container
const cache = {}
const db = new DbHandler()


/**
 * /////////// The function to handle history data (remaining wall width)
 * @param {number} poyas 
 * @param {Array} dates
 */
export const handleHistory = async (poyas, dates) => {
	// try pulling data from cache
	const result = pullFromCache(dates, poyas, cache)		// result structure is { [date]: {...}, [date2]: {...} }
	let remainingDates = result.reminingDates

	// if there's any non-cached date left
	if (remainingDates.length) {
		showLoading()

		const begin = new Date(remainingDates[0]) > new Date("2020-03-01") ? "2020-03-01" : remainingDates[0]
		const end = remainingDates[remainingDates.length - 1]

		try {
			const pullData = await db.pullSingleHistoryAsync(begin, end, poyas)
			pushToCache(pullData, poyas, cache)

			// fill up result and gather absent dates
			remainingDates = remainingDates.reduce((acc, curr) => {
				if (curr in pullData) {									// if we got current date from the database
					result.data[curr] = pullData[curr]
					return acc
				}

				return acc.concat(curr)
			}, [])

			// handling absent dates
			if (remainingDates.length) {
				const absentResult = await handleAbsentDates(remainingDates, poyas)
				if (!absentResult)
					throw new Error("request cancelled")

				Object.keys(absentResult).forEach(aKey => result.data[aKey] = absentResult[aKey])
			}
		}
		catch (error) {
			if (error.message === "request cancelled")
				return null

			console.error(error)
		}
	}

	return makeChartData(result.data, +poyas)
}





/////////////////////// rearranging result for chart
const makeChartData = (datesData, poyas) => {
	let chartResult = []

	Object.keys(datesData).forEach(date => {
		const chartPoint = { date }
		const data = datesData[date]

		data.forEach(point => {
			const luch = point.luch

			let rWall;
			switch (poyas) {
				case 8: rWall = 5586; break
				case 9: rWall = 5471.5; break
				case 10: rWall = 5333.5; break
				case 11: rWall = 5229; break
				case 12: rWall = 5113.5; break
				default: rWall = 5668; break		// 3, 4, 5, 6, 7 belts
			}

			chartPoint[`Луч ${luch}`] = poyas === 1668 || poyas === 0
				? Math.round(point.r1150)
				: Math.round(rWall - point.r1150)	///// calculating rest wall width
		})
		chartResult.push(chartPoint)
	})

	chartResult.sort((a, b) => (a.date > b.date) ? 1 : ((b.date > a.date) ? -1 : 0))
	return chartResult
}




/////////////////////// saving calculated date to dBase function
export const handleAbsentDates = async (dates, poyas) => {
	const absentResult = {}

	// the day before for Error handler
	const firstDateSub1day = moment(dates[0]).add(-1, "day").toISOString(true).slice(0, 10)

	try {
		const rawData = await db.getIntervalAsync(firstDateSub1day, dates[dates.length - 1])

		const tasks = dates.map(async date => {

			// when it is 00:01...01:00, there is no hour history
			if (date in rawData) {
				const theDayBefore = moment(date).add(-1, "day").toISOString(true).slice(0, 10)

				const context = [theDayBefore, date].reduce((acc, date) => {
					acc[date] = rawData[date]
					return acc
				}, {})

				const radiuses = await gornChain.handle(context)

				const history = T1150History.getList(radiuses, radiuses.net1150, date)
				absentResult[date] = history.filter(h => h.poyas === +poyas)

				db.putSingleHistoryAsync(history)
			}
		})

		await Promise.all(tasks)

		pushToCache(absentResult, poyas, cache)
		return absentResult

	} catch (error) { console.error(error) }
}




/////////////////////////// forecast
export const addForecast = (points, poyas, sutki) => {
	// requested forecast dates
	const requestedDates = Array.from({ length: sutki }, (_, i) => i).map(offset => moment().add(offset, "day").format("YYYY-MM-DD"))

	// forecast dates that are already within points
	const pointsForecastDates = points.filter(pt => moment(pt.date) >= moment().startOf("day")).map(pt => pt.date)

	// if user reduced the range of approcsimation
	if (pointsForecastDates.length >= requestedDates.length) {
		const datesToRemove = pointsForecastDates.filter(pfd => !requestedDates.includes(pfd))
		const alivePoints = points.filter(pt => !datesToRemove.includes(pt.date))
		return alivePoints
	}

	// if user increased the range append only the rest of them
	const newForecastDates = requestedDates.reduce((acc, nfd) => {
		if (points.some(pt => pt.date === nfd))
			return acc

		return acc.concat(nfd)
	}, [])


	// the zero point for approximation
	// the day when furnace passed warming up procedure and started production session
	const initialDate = "2020-05-15"

	// there are 32 rays. For each of them count factors
	Array.from({ length: 32 }, (_, i) => i + 1).forEach(luch => {
		let count = 1

		// count avg values of each date for certain luch
		const avgs = Object.keys(cache).reduce((acc, date) => {
			const X = count++
			const r1150 = cache[date][poyas][luch - 1]["r1150"]
			const rWall = poyas < 8
				? 5668
				: poyas === 8
					? 5586
					: poyas === 9
						? 5471.5
						: poyas === 10
							? 5333.5
							: poyas === 11 ? 5229 : 5113.5

			const Y = poyas === 0 || poyas === 1668
				? Math.round(r1150)
				: Math.round(rWall - r1150)

			acc.summX += X
			acc.summY += Y
			acc.summXY += X * Y

			return acc
		}, { summX: 0, summY: 0, summXY: 0 })

		const total = --count

		const Xs = avgs.summX / total
		const Ys = avgs.summY / total
		const XYs = avgs.summXY / total

		// count dispersion 
		let summDisp = 0
		while (count > 0)
			summDisp += (count-- - Xs) ** 2

		const disp = summDisp / total

		// line factors
		const A = (XYs - Ys * Xs) / disp
		const B = Ys - A * Xs

		// count each newForecastDate
		newForecastDates.forEach(dt => {
			const endDate = moment(dt)
			const endDateNum = endDate.diff(moment(initialDate), "day") + 1
			const endRWall = Round(A * endDateNum + B)														// count value

			const newDate = endDate.format("YYYY-MM-DD")

			let newDatePoint = points.filter(pt => pt.date === newDate)[0]
			if (!newDatePoint) {
				newDatePoint = { date: newDate }
				points.push(newDatePoint)
			}

			const luchName = `Луч ${luch}`
			newDatePoint[luchName] = endRWall
		})
	})

	return points
}