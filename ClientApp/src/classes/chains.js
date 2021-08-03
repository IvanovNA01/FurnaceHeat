import { devideData } from '../algorithm/devideData';
import { complementData } from '../algorithm/complementData';
import { leshad } from '../algorithm/leshad';
import { gorn } from '../algorithm/gorn'
import basicPoyasa from '../utils/basicPoyasa.json'
import { SensorErrorHandler } from './Handlers/SensorErrorHandler';


//////////////////////// ABSTRACT IHANDLER
class IChainHandler {
	successor = null

	constructor(successor) { this.successor = successor }

	handle(context) { throw Error("Can't call abstract handler method handle()") }
}


//////////////////////// DEVIDE HANDLER
class DevideHandler extends IChainHandler {
	newContext

	constructor(successor = null) { super(successor) }

	async handle(context) {
		if (!context)
			throw Error("DevideHandler: context is null!")

		if (Object.keys(context).length === 2)
			this.newContext = await SensorErrorHandler.handle(context)
		else if (Array.isArray(context))
			this.newContext = devideData(context)

		return !!this.successor ? await this.successor.handle(this.newContext) : this.newContext
	}
}



//////////////////////// COMPLEMENT HANDLER
class ComplementHandler extends IChainHandler {
	constructor(successor = null) { super(successor) }

	async handle(context) {
		if (!context)
			throw Error("ComplementHandler: context is null!")

		const newContext = complementData(context)
		newContext["complementedBareTemps"] = {}
		Object.keys(newContext.bareTemps).forEach(poyas => {
			if (poyas !== "errors") {
				newContext.complementedBareTemps[poyas] = {}

				Object.keys(newContext.bareTemps[poyas]).forEach(luch => {
					newContext.complementedBareTemps[poyas][luch] = {}

					Object.keys(newContext.bareTemps[poyas][luch]).forEach(radius => {
						newContext.complementedBareTemps[poyas][luch][radius] = newContext.bareTemps[poyas][luch][radius]
					})
				})
			}
		})

		newContext.complementedBareTemps = complementData(newContext.complementedBareTemps)
		return !!this.successor ? await this.successor.handle(newContext) : newContext
	}
}



//////////////////////// LESHAD IHANDLER
class LeshadHandler extends IChainHandler {
	constructor(successor = null) { super(successor) }

	async handle(context) {
		if (!context)
			throw Error("LeshadHandler: context is null!")

		const newContext = leshad(context)
		return !!this.successor ? await this.successor.handle(newContext) : newContext
	}
}



//////////////////////// GORN IHANDLER
class GornHandler extends IChainHandler {
	constructor(successor = null) { super(successor) }

	async handle(context) {
		if (!context)
			throw Error("GornHandler: context is null!")

		const newContext = gorn(basicPoyasa, context)

		newContext.net1150 = context.net1150
		newContext.errors = context.errors
		return !!this.successor ? await this.successor.handle(newContext) : newContext
	}
}



///// implementation
const gHandler = new GornHandler()
const lHandler = new LeshadHandler(gHandler)
const cHandler = new ComplementHandler(lHandler)
export const gornChain = new DevideHandler(cHandler)


const complementHandler = new ComplementHandler()
export const complementChain = new DevideHandler(complementHandler)