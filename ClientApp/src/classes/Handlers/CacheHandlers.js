


/**
 * ///////////// Retrieves a cach data from cache
 * @param {Array} dates - changes by ref!!!
 * @param {number} poyas 
 * @param {Object} cache 
 */
export const pullFromCache = (dates, poyas, cache) => {
	const result = { reminingDates: null, data: {} }

	dates = dates.reduce((acc, curr) => {
		if (curr in cache) {
			const dateSet = cache[curr]	/// { [date]: { poyas1: {...}, poyas2: {...}, .... } }

			if (poyas in dateSet) {
				result.data[curr] = dateSet[poyas]
				console.log("chartData from cache")//////////////////////////
				return acc
			}
		}

		return acc.concat(curr)
	}, [])
	result.reminingDates = dates

	return result
}



/**
 * ///////////////////// stores data to cache
 * @param {Object} objToCache 
 * @param {number} poyas 
 * @param {Object} cache 
 */
export const pushToCache = (objToCache, poyas, cache) => {
	Object.keys(objToCache).forEach(date => {
		const cacheForDate = { ...cache[date] } || {}
		cacheForDate[poyas] = objToCache[date]
		cache[date] = cacheForDate
	})
}