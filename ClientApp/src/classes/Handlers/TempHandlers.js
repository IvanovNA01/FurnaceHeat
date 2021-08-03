import { devideData } from '../../algorithm/devideData'
import { DbHandler } from "./DbHandler"
import { pullFromCache, pushToCache } from './CacheHandlers'


//////////////////// the cache container
const tCache = {}
const db = new DbHandler()


/**
 * ////////////////////////// The function to gather temp data
 * @param {number} poyas 
 * @param {Array} dates
 * @param {function} hideHandler - a function to hide checkboxes
 */
export const handleTemp = async (poyas, dates, hideHandler) => {
	// try pulling data from cache
	const result = pullFromCache(dates, poyas, tCache)		// result structure is { [date]: {...}, [date2]: {...} }
	const remainingDates = result.reminingDates

	// if there's any non-cached date left
	if (remainingDates.length) {
		hideHandler(true)

		try {
			const getIntervalData = await db.pullIntervalHistoryAsync(remainingDates[0], remainingDates[remainingDates.length - 1], poyas)

			const data = {}
			Object.keys(getIntervalData).forEach(date => {
				data[date] = devideData(getIntervalData[date])[poyas]
				remainingDates.includes(date) && (result.data[date] = data[date])
			})

			pushToCache(data, poyas, tCache)
		}
		catch (error) {
			if (!error.message.includes("redundant") && !error.message.includes("abort"))
				window.alert(error.message)

			return null
		}
	}

	return result.data
}




///////////////// casts data to the chart format data
export const makeChartData = result => {
	if (!result)	// to avoid error while fast datepicker scrolling
		return

	let chartResult = []

	Object.keys(result).forEach(date => {
		const chartPoint = { date }

		Object.keys(result[date]).forEach(luch => {
			Object.keys(result[date][luch]).forEach(radius => {
				const pointValue = Math.round(result[date][luch][radius])
				chartPoint[`Луч ${luch}, R ${radius}`] = pointValue > 1000 ? -10 : pointValue
			})
		})
		chartResult.push(chartPoint)
	})

	chartResult.sort((a, b) => (a.date > b.date) ? 1 : ((b.date > a.date) ? -1 : 0))
	return chartResult;
}