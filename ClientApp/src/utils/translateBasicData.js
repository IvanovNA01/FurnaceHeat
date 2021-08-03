import { complementChain } from '../classes/chains'
import basicDataToTranslate from './basicDataToTranslate.json'

export const translateBasicData = async () => {
	const newBasicPoyasa = JSON.stringify(await complementChain.handle(basicDataToTranslate))
	debugger
	return newBasicPoyasa
}