import "isomorphic-fetch"
import 'promise-polyfill/src/polyfill'
import 'abortcontroller-polyfill'


const cache = {}


export class DbHandler {
	// the counter for async requests - счетчик ассинхр запросов
	// necessary when user quickly skims through dates to avoid redundant calls to server 
	// необходимо, когда пользователь быстро просматривает даты, чтобы избежать повторных обращений к серверу
	instantRequestsCounter = 0
	getIntervalAsyncCount = 0

	// abort controller. Cancels pending fetch
	//Контроллер прерывания. Отменяет ожидающую выборку
	controller
	getIntervalAsyncController


	/** @returns app version */
	static async getAppVersion() {
		const resp = await fetch("/api/heat/GetAppVersion")
		if (!resp.ok)
			throw new Error(`[GetAppVersion]: ${resp.text()}`)

		return await resp.text()
	}


	//////////// HOME
	/** @returns instant data from the database - мгновенные данные */
	async getInstantAsync() {
		const resp = await fetch("/api/heat/Instant")
		if (resp.ok)
			return await resp.json()
		throw new Error("db is offline")
	}

	/**
	 * Это часть комментариев к коду. @param указывает входные данные для функции, @returns указывает, что будет возвращено из функции.
	 * @param {string} eDate today
	 * @param {string} bDate yesterday
	 */
	async getIntervalAsync(bDate, eDate) {
		++this.getIntervalAsyncCount
		const currentCount = this.getIntervalAsyncCount
		await this.timeout(1000)	// delay this request for 1s

		// check if there are new requests
		if (currentCount === this.getIntervalAsyncCount) {
			// override pending request
			!!this.getIntervalAsyncController && this.getIntervalAsyncController.abort()
			this.getIntervalAsyncController = new window.AbortController()

			const resp = await fetch(`/api/heat/GetForInterval?bDate=${bDate}&eDate=${eDate}`, { signal: this.getIntervalAsyncController.signal })
			if (resp.ok)
				return await resp.json()
			throw new Error("db is offline")
		}
	}

	/**
	 * retrieves data for the date from the database
	 * извлекает данные для интервала между двумя датами из базы данных
	 * @param {string} date desired date
	 */
	async getSingleDateAsync(date) {
		const resp = await fetch(`api/heat/GetFor?dt=${date}`)
		if (resp.ok)
			return await resp.json()
		throw new Error("db is offline")
	}


	///////////// ERRORS
	/**
	 * puts errors to the database
	 * помещает ошибки в базу данных
	 * @param {SensorError[]} newErrors discovered errors
	 */
	async putErrorsAsync(newErrors) {
		fetch(`api/heat/PutSensorErrors`, {
			method: "PUT",
			headers: {
				"Accept": "application/json",
				"Content-Type": "application/json",
			},
			body: JSON.stringify(newErrors),
		})
	}

	/** @returns Promise<SensorError[ ]> */
	async loadErrorsAsync() {
		const resp = await fetch(`api/heat/GetSensorErrors`)
		if (resp.ok)
			return await resp.json()
		throw new Error("db is offline")
	}


	//////////// USAGE
	/** @returns Promise<string[]> - users' ip's from UsageLogs table */
	async getIpsAsync() {
		const resp = await fetch("api/heat/getusageips")
		if (resp.ok)
			return (await resp.json()).filter(ip => !window.usageIpExclude.some(ex => ex === ip))
		throw new Error("db is offline")
	}

	/**
	 * returns entries of UsageLogs table
	 * @param {string} date desired date
	 * @returns Promise<UsageLogs[]>
	 */
	async getUsageForDateAsync(date) {
		const resp = await fetch(`api/heat/GetUsageFor?what=${date}`)
		if (resp.ok)
			return UsageAdapter.decode(await resp.json())
		throw new Error("db is offline")
	}

	/**
	 * returns entries of UsageLogs table
	 * @param {string} ip desired ip
	 * @returns Promise<UsageLogs[]>
	 */
	async getUsageForIpAsync(ip) {
		const resp = await fetch(`api/heat/GetUsageFor?what=${ip}`)
		if (resp.ok)
			return UsageAdapter.decode(await resp.json())
		throw new Error("db is offline")
	}

	/**
	 * returns entries of UsageLogs table
	 * @param {string} date desired date
	 * @param {string} ip desired ip
	 * @returns Promise<UsageLogs[]>
	 */
	async getUsageForAsync(date, ip) {
		const resp = await fetch(`api/heat/GetUsageForAll?dt=${date}&ip=${ip}`)
		if (resp.ok)
			return UsageAdapter.decode(await resp.json())
		throw new Error("db is offline")
	}


	/////////// HISTORY
	/**
	 * retrieves history record from the database
	 * @param {string} begin start date
	 * @param {string} end end date
	 * @param {string} poyas desired poyas
	 * @returns {Promise<object>} set
	 */
	async pullSingleHistoryAsync(begin, end, poyas) {
		const resp = await fetch(`api/heat/PullDate?bDate=${begin}&eDate=${end}&poyas=${poyas}`)
		const data = await resp.json()

		if (resp.ok)
			return data
		throw new Error(data.error)
	}

	/**
	 * writes calculated value to the database
	 * @param {T1150History} history the T1150History instance
	 */
	async putSingleHistoryAsync(history) {
		fetch(`api/heat/PutDate`, {
			method: "PUT",
			headers: {
				"Accept": "application/json",
				"Content-Type": "application/json",
			},
			body: JSON.stringify(history),
		})
	}

	/**
	 * retrieves history interval from the database
	 * @param {string} begin start date
	 * @param {string} end end date
	 * @param {string} poyas desired poyas
	 * @returns {Promise<object>} set
	 */
	async pullIntervalHistoryAsync(begin, end, poyas) {
		++this.instantRequestsCounter
		let currentCount = this.instantRequestsCounter

		await this.timeout(1000)	// delay this request for 1s

		// check if there are new requests
		if (currentCount === this.instantRequestsCounter) {
			// override pending request
			!!this.controller && this.controller.abort()
			this.controller = new window.AbortController()

			const link = `api/heat/GetIntervalFor?bDate=2020-02-15&eDate=${end}&poyas=${poyas}`

			const resp = await fetch(link, { signal: this.controller.signal })
			const data = await resp.json()
			if (resp.ok)
				return data

			throw new Error(data.error)
		}
		throw new Error("redundant query")
	}



	/////////// HEAT FLOW
	async pullHeatFlowDataAsync(begin, end, poyas) {
		++this.instantRequestsCounter
		let currentCount = this.instantRequestsCounter

		await this.timeout(1000)	// delay this request for 1s

		// check if there are new requests
		if (currentCount === this.instantRequestsCounter) {
			// override pending request
			!!this.controller && this.controller.abort()
			this.controller = new window.AbortController()

			const sensorLink = +poyas === 0 || +poyas === 1668 || +poyas === 3518
				? `/api/heat/GetIntervalFor?bDate=2020-02-15&eDate=${end}&poyas=1`
				: `/api/heat/GetIntervalFor?bDate=2020-02-15&eDate=${end}&poyas=${poyas}`

			const r1150poyas = +poyas === 0 || +poyas === 1668 || +poyas === 3518 ? "0" : poyas
			const r1150Link = `api/heat/PullDate?bDate=2020-02-15&eDate=${end}&poyas=${r1150poyas}`

			const result = {}
			if (sensorLink in cache && r1150Link in cache) {
				result.sensors = cache[sensorLink]
				result.r1150 = cache[r1150Link]
				return result
			}

			try {
				const requests = [sensorLink, r1150Link].map(link => fetch(link, { signal: this.controller.signal }))
				const resp = await Promise.all(requests)

				if (resp[0].ok) {
					if (resp[1].ok) {
						const sensorLinkData = await resp[0].json()
						const r1150LinkData = await resp[1].json()

						cache[sensorLink] = sensorLinkData
						cache[r1150Link] = r1150LinkData

						result.sensors = sensorLinkData
						result.r1150 = r1150LinkData
						return result
					}
					else throw Error((await resp[1].json()).error)
				}
				else throw Error((await resp[0].json()).error)
			}
			catch (error) { throw new Error(`[db.pullHeatFlowDataAsync]: ${error}`) }
		}
		throw new Error("redundant query")
	}



	/**
	 * invokes a delay
	 * @param {number} ms offset
	 */
	timeout = (ms) => new Promise(resolve => setTimeout(resolve, ms))
}






/////////////////////////// USAGE DATA ADAPTER
/**
 * Converts raw db data to necessary format
 */
class UsageAdapter {

	static decodePath = path => {
		if (path.toLowerCase().includes("getintervalfor")) return "Тренды: Толщина стенки"
		if (path.toLowerCase().includes("getforinterval")) return "Разгар горна (текущая дата)"
		if (path.toLowerCase().includes("getfor")) return "Разгар горна (прошлая дата)"
		if (path.toLowerCase().includes("pulldate")) return "Тренды: Толщина стенки"
		if (path.toLowerCase().includes("getusagefordate")) return "Статистика"
		if (path.toLowerCase().includes("getusageforip")) return "Статистика"
		if (path.toLowerCase().includes("getusagefor")) return "Статистика"
		return path
	}

	static decodeParams = params => {
		return params
			.replaceAll("&", ", ")
			.replaceAll("=", ": ")
			.replaceAll("bDate", "c")
			.replaceAll("eDate", "по")
			.replaceAll("poyas", "Пояс")
			.replaceAll("dt", "за")
			.replaceAll("ip", "IP")
			.replaceAll("what", "по")
			.replaceAll(/T\S*/g, " ")
	}

	/**
	 * staple class function
	 * @param {object} usageLogs the set of usage logs
	 */
	static decode(usageLogs) {
		const filtered = usageLogs.filter(row => !window.usageIpExclude.some(ex => ex === row.ip))

		return filtered.map(row => ({
			date: row.date,
			ip: row.ip,
			method: this.decodePath(row.method),
			params: this.decodeParams(row.params)
		}))
	}
}
