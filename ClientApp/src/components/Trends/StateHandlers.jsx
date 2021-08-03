import Moment from 'moment'
import { extendMoment } from 'moment-range'
import { addForecast, handleHistory } from '../../classes/Handlers/HistoryHandlers'
import { handleHeatFlow } from "../../classes/Handlers/HeatFlowHandlers"
import { handleTemp, makeChartData } from '../../classes/Handlers/TempHandlers'
import { TrendMenu } from './Menu'
import { hideLoading, showLoading } from "../Layout/extra"

const moment = extendMoment(Moment)


/////////////////////////// Abstract
class IStateHandler {
	trends
	bDate
	eDate
	dates
	poyas
	chartData
	luchTitleEls
	rWallCheckedLuchi = []
	tempsCheckedLuchi = []
	heatFlowCheckedLuchi = []
	chBoxEls
	chartTitle

	constructor(trends) {
		this.trends = trends
		this.luchTitleEls = document.querySelectorAll('.luchi')
		this.chartTitle = document.querySelector(".title")
	}

	handleRadio(inputValue) {
		this.bDate = this.trends.state.bDateEl.value
		this.eDate = this.trends.state.eDateEl.value

		if (this.bDate >= this.eDate || this.eDate === moment().toISOString(true).slice(0, 10)) {
			const error = "Неверно выбран интервал дат. Пожалуйста, измените свой выбор"
			this.trends.setState({ error: error })
			throw Error()
		}

		const range = moment.range(this.bDate, this.eDate)
		this.dates = Array.from(range.by("day")).map(d => d.toISOString(true).slice(0, 10))

		this.poyas = inputValue.slice(1)
		this.chartData = { poyas: +this.poyas, data: null }
	}

	handleCheckbox() {
		this.chBoxEls = document.querySelectorAll(".custom-checkbox")

		if (this.rWallCheckedLuchi.length > 10 || this.tempsCheckedLuchi.length > 10 || this.heatFlowCheckedLuchi.length > 10) {
			this.chBoxEls.forEach(c => c.style.color = "red")
			this.luchTitleEls.forEach(lt => {
				lt.style.color = "red"
				lt.innerHTML = `Перебор (очистить)`
			})
		}
		else {
			this.chBoxEls.forEach(c => c.style.color = "unset")
			this.luchTitleEls.forEach(lt => {
				lt.innerHTML = `Видимые лучи`
				lt.style.color = "#6c757d"
			})
		}
	}

	handleDate(which) {
		///////////////////////////////////////////////////// wrong dates interval protection
		const bDate = document.getElementById("bDate")
		const eDate = document.getElementById("eDate")

		const bDateMoment = moment(bDate.value)
		const eDateMoment = moment(eDate.value)

		if (which === "begin") {
			if (bDateMoment >= eDateMoment || eDateMoment.diff(bDateMoment, "day") < 13) {
				bDate.value = eDateMoment.subtract(13, "day").format("YYYY-MM-DD")
				alert("Неправильно задан интервал дат. Минимальный интервал 2 недели")
			}
		}

		if (which === "end") {
			if (eDateMoment >= moment().subtract(1, "day")) {
				eDate.value = moment().subtract(1, "day").format("YYYY-MM-DD")
				alert("Неправильно задана конечная дата. Максимальный день - вчера")
			}

			if (bDateMoment >= eDateMoment || eDateMoment.diff(bDateMoment, "day") < 13) {
				bDate.value = eDateMoment.subtract(13, "day").format("YYYY-MM-DD")
				bDate.click()
			}
		}

		if (!this.poyas)
			return

		this.handleRadio(`_${this.poyas}`)		////// the symbol _ is necessary to avoid luchi clearing at TempHandler.handleRadio()
	}

	clearLuchi = () => {
		document.querySelectorAll('.chbox:checked').forEach(c => c.checked = false)
		this.rWallCheckedLuchi.length = 0
		this.tempsCheckedLuchi.length = 0
		this.heatFlowCheckedLuchi.length = 0
		document.querySelectorAll(".custom-checkbox").forEach(c => c.style.color = "unset")
		document.querySelectorAll(".temp-luchi-card .card-header").forEach(el => el.classList.remove("active"))

		this.luchTitleEls.forEach(lt => {
			lt.innerHTML = `Видимые лучи`
			lt.style.color = "#6c757d"
		})
	}

	switchHandler(to) {
		switch (to) {
			case 'Толщина стенки': this.trends.stateHandler = new RWallHandler(this.trends); break
			case 'Температуры': this.trends.stateHandler = new TempHandler(this.trends); break
			case 'Тепловые потоки': this.trends.stateHandler = new HeatFlowHandler(this.trends); break
			default: throw Error(`[IStateHandler]: wrong state provided >>> '${to}'`)
		}
	}

	forecastClick() {
		throw Error("[IStateHandler]: call of non-implemented abstract `forecastClick` method")
	}
}



/////////////////////////// RWALL HANDLER
export class RWallHandler extends IStateHandler {

	async handleRadio(value) {
		try {
			super.handleRadio(value)
		} catch (error) { return }

		if (this.rWallCheckedLuchi.length > 10 || this.rWallCheckedLuchi.length === 0) {
			TrendMenu.clearRadios()

			if (this.rWallCheckedLuchi.length === 0) {
				alert("Пожалуйста, выберите необходимые лучи")
				return
			}

			alert("График из более чем 10 трендов нечитаем. Пожалуйста, измените свой выбор")
			return
		}

		try {
			this.chartData.data = await handleHistory(this.poyas, this.dates)
			if (this.chartData.data === null)
				throw Error("rWallHandler: handleHistory cancelled")

			this.chartData.luchi = this.rWallCheckedLuchi.concat()
			this.chartData.chartType = "r1150"

			this.trends.setState({ chartData: this.chartData, blink: false, chartVisible: true })
		} catch (error) {
			if (error.message !== "rWallHandler: handleHistory cancelled")
				console.error(error);
		}
	}

	handleCheckbox(e) {
		if (e) {
			if (e.target.checked)
				this.rWallCheckedLuchi.push(+e.target.id.slice(4))
			else
				this.rWallCheckedLuchi = this.rWallCheckedLuchi.filter(num => num !== +e.target.id.slice(4))

			super.handleCheckbox()

			this.chBoxEls.forEach(c => c.classList.remove("mylink", "blink_me"))

			if (this.rWallCheckedLuchi.length) {
				const chartData = this.trends.state.chartData

				if (chartData && chartData.chartType === "r1150") {
					const newChartData = Object.assign({}, this.trends.state.chartData)

					newChartData.luchi = [...this.rWallCheckedLuchi]
					this.trends.setState({ chartData: newChartData })
				}
			}
		}
	}

	clearAll() {
		TrendMenu.clearRadios()
		this.clearLuchi()
		this.trends.setState({ chartVisible: false, blink: true })
	}

	forecastClick(sut) {
		const newPoints = addForecast(this.chartData.data.concat(), this.chartData.poyas, +sut)
		const newChartData = { ...this.chartData }
		newChartData.data = newPoints
		newChartData.luchi = this.rWallCheckedLuchi.concat()
		this.chartData = { ...newChartData }
		this.trends.setState({ chartData: newChartData, blink: false, chartVisible: true })
	}
}



/////////////////////////// TEMPERATURE HANDLER
export class TempHandler extends IStateHandler {

	async handleRadio(value) {
		if (value[0] !== "_")
			this.clearLuchi()

		try {
			super.handleRadio(value)
		} catch (error) { return }

		const serverData = await handleTemp(this.poyas, this.dates, this.hideChBoxes)
		if (!serverData || Object.keys(serverData).length === 0)
			return

		const chBoxData = {}
		const firstDate = Object.keys(serverData)[0]
		Object.keys(serverData[firstDate]).forEach(luch => chBoxData[luch] = [...Object.keys(serverData[firstDate][luch])])

		const newState = {
			chBoxesTemp: chBoxData,
			blink: false
		}

		this.chartData.data = makeChartData(serverData)

		if (this.tempsCheckedLuchi.length) {
			const newChartData = {
				data: [...this.chartData.data],
				chartType: "temp",
				poyas: this.poyas,
				luchi: this.tempsCheckedLuchi.map(pair => `${pair.luch}, R ${pair.radius}`),
			}

			newState.chartData = newChartData
		}

		this.trends.setState(newState)
		this.showChBoxes()
	}

	handleCheckbox(e) {
		if (e) {
			const split = e.target.id.split('-')
			const luch = split[0].slice(1)
			const radius = split[1].slice(1)

			const currentHeader = document.getElementById(`tluch${luch}`)

			if (e.target.checked) {
				this.tempsCheckedLuchi.push({ luch, radius })

				setTimeout(() => {
					if (!currentHeader.classList.contains("active"))
						currentHeader.classList.add("active")
				}, 0)
			}
			else {
				this.tempsCheckedLuchi = this.tempsCheckedLuchi.filter(item => item.luch === luch && item.radius === radius ? false : true)
				const luchChecks = this.tempsCheckedLuchi.filter(pair => pair.luch === luch)
				if (!luchChecks.length && currentHeader.classList.contains("active"))
					currentHeader.classList.remove("active")
			}

			super.handleCheckbox()
		}

		if (this.tempsCheckedLuchi.length) {
			const newChartData = {
				data: [...this.chartData.data],
				chartType: "temp",
				poyas: this.chartData.poyas,
				luchi: this.tempsCheckedLuchi.map(pair => `${pair.luch}, R ${pair.radius}`),
			}

			this.trends.setState({ chartData: newChartData, chartVisible: true })
		}
	}

	hideChBoxes = (loading = false) => {
		const chBoxContainer = document.querySelector(".temp-checkbox-wrapper")

		loading && showLoading()
		chBoxContainer.style.opacity = 0
		setTimeout(_ => chBoxContainer.style.display = "none", 500)
	}

	showChBoxes = _ => {
		const chBoxContainer = document.querySelector(".temp-checkbox-wrapper")

		chBoxContainer && setTimeout(() => {
			chBoxContainer.style.display = "flex"
			setTimeout(() => {
				chBoxContainer.style.opacity = 1
				hideLoading()
			}, 300)
		}, 0)
	}

	clearAll = _ => {
		TrendMenu.clearRadios()
		this.clearLuchi()
		this.hideChBoxes()
		this.trends.setState({ chartVisible: false, blink: true })
	}


}



/////////////////////////// HEATFLOW HANDLER
export class HeatFlowHandler extends IStateHandler {
	handleCheckbox(e) {
		if (e) {
			if (e.target.checked)
				this.heatFlowCheckedLuchi.push(+e.target.id.slice(4))
			else
				this.heatFlowCheckedLuchi = this.heatFlowCheckedLuchi.filter(num => num !== +e.target.id.slice(4))

			super.handleCheckbox()

			this.chBoxEls.forEach(c => c.classList.remove("mylink", "blink_me"))

			if (this.heatFlowCheckedLuchi.length) {
				const chartData = this.trends.state.chartData

				if (chartData && chartData.chartType === "heatFlow") {
					const newChartData = Object.assign({}, this.trends.state.chartData)

					newChartData.luchi = [...this.heatFlowCheckedLuchi.map(luch => luch - 32)]
					this.trends.setState({ chartData: newChartData })
				}
			}
		}
	}

	async handleRadio(value) {
		try {
			super.handleRadio(value)
		} catch (error) { return }

		if (this.heatFlowCheckedLuchi.length > 10 || this.heatFlowCheckedLuchi.length === 0) {
			TrendMenu.clearRadios()

			if (this.heatFlowCheckedLuchi.length === 0) {
				alert("Пожалуйста, выберите необходимые лучи")
				return
			}

			alert("График из более чем 10 трендов не читаем. Пожалуйста, измените свой выбор")
			return
		}

		try {
			this.chartData.data = await handleHeatFlow(this.poyas, this.dates.concat())

			this.chartData.luchi = this.heatFlowCheckedLuchi.map(luch => luch - 32)
			this.chartData.chartType = "heatFlow"

			this.trends.setState({ chartData: this.chartData, blink: false, chartVisible: true })
		} catch (error) {
			console.error(error);
			return
		}
	}

	clearAll = _ => {
		TrendMenu.clearRadios()
		this.clearLuchi()
		this.trends.setState({ chartVisible: false, blink: true })
	}
}