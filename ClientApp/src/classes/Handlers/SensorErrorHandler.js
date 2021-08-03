import basicPoyasa from '../../utils/basicPoyasa.json'
import { devideData } from '../../algorithm/devideData';
import { SensorError } from '../Entities/SensorError';
import { DbHandler } from "./DbHandler";


export class SensorErrorHandler {
	static initialContext
	static yestContext
	static newContext
	static db = new DbHandler()
	static dbErrors = []



	/////////////////////////////// HANDLE
	static async handle(context) {
		try { this.dbErrors = await this.db.loadErrorsAsync() }
		catch (error) { console.error(error) }

		const dates = Object.keys(context)
		const today = dates[1]
		const today1day = dates[0]

		this.initialContext = basicPoyasa
		this.yestContext = devideData(context[today1day])
		this.newContext = devideData(context[today])

		/////////////////////////// corruption test is to be performed within complementData!
		this.newContext["errors"] = {}

		const errors = []				// entire new errors array
		const newErrors = []		// the new errors absent in db

		// check each sensor to be invalid
		Object.keys(this.newContext).forEach(poyas => {
			if (poyas === "errors")
				return

			Object.keys(this.newContext[poyas]).forEach(luch => {
				Object.keys(this.newContext[poyas][luch]).forEach(radius => {
					const initialT = this.initialContext[poyas][luch][radius]
					const yestT = this.yestContext[poyas][luch][radius]
					const todayT = this.newContext[poyas][luch][radius]

					if (this.sensorFailure(todayT, yestT, initialT)) {
						const error = new SensorError(poyas, luch, radius, todayT)
						errors.push(error)

						if (this.dbErrors.length === 0)
							newErrors.push(error)
						else {
							const dbEr = this.dbErrors.filter(er => SensorError.equals(er, error))[0]
							this.dbErrors.forEach(err => SensorError.equals(err, error) && (error.date = err.date))
							!dbEr && newErrors.push(error)
						}

						error.nonActive = false
						this.addContextError(error)
						this.newContext[poyas][luch][radius] = initialT * this.findValidSensor(poyas, luch, radius)
					}
				})
			})
		})

		this.dbErrors.forEach(dbEr => {
			if (!errors.some(er => SensorError.equals(er, dbEr))) {
				const error = new SensorError(dbEr)
				error.nonActive = true
				this.addContextError(error)
			}
		})

		// add new errors to db
		if (newErrors.length > 0)
			this.db.putErrorsAsync(newErrors)

		return this.newContext
	}


	//////////////////////////// SENSOR FAILURE
	// not abs(todayT-yestT) because todayT might be below yestT
	static sensorFailure = (todayT, yestT, initialT) => todayT === 0 || todayT - yestT > 100 || todayT > initialT * 2



	//////////////////////////// ADD ERROR
	static addContextError(error) {	// adds error object to the context
		const poyas = error.poyas
		const luch = error.luch
		const radius = error.radius

		if (!this.newContext.errors[poyas])
			this.newContext.errors[poyas] = {}

		if (!this.newContext.errors[poyas][luch])
			this.newContext.errors[poyas][luch] = {}

		this.newContext.errors[poyas][luch][radius] = error//.toString()
	}


	////////////////////////////// FIND VALID SENSOR
	static findValidSensor(poyas, luch, radius) {		// find a valid sensor

		const handleStep = luch => {	// checks by n steps ahead and behind current luch
			luch = luch + ''
			const inT = +radius in this.initialContext[poyas][luch] ? this.initialContext[poyas][luch][radius] : null
			const yeT = +radius in this.yestContext[poyas][luch] ? this.yestContext[poyas][luch][radius] : null
			const toT = +radius in this.newContext[poyas][luch] ? this.newContext[poyas][luch][radius] : null

			if (inT && yeT && toT && !this.sensorFailure(toT, yeT, inT))
				return toT / inT
		}

		const stapleArea = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28]
		const shortArea = [29, 30, 31, 32, 1, 2, 3, 4, 5,]

		const interval = shortArea.includes(+luch) ? shortArea : stapleArea

		let delta = 1

		while (+delta < interval.length) {
			const forward = interval.includes(+luch + delta) && (+luch + delta) + '' in this.yestContext[poyas] ? +luch + delta : null
			let result = forward ? handleStep(forward) : null
			if (result)
				return result

			const backward = interval.includes(luch - delta) && (+luch - delta) + '' in this.yestContext[poyas] ? luch - delta : null
			result = backward ? handleStep(backward) : null
			if (result)
				return result

			++delta
		}

		return 0
		//throw Error("[findValidSensor]: Couldn't find a substitution for an invalid sensor")
	}
}