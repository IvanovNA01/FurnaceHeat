import React, { Component } from 'react';
import { AutoUpdate, DateGroup } from '../templates';
import { Menu } from './menu';
import { RadialChart } from './radialChart';
import { VerticalChart } from './verticalChart';
import { pullPoyas } from '../../algorithm/pullPoyas'
import { pullLuch } from '../../algorithm/pullLuch';
import { ErrorsTable } from './errorsTable';
import { LastHourTable } from './lastHourTable';
//import { translateBasicData } from '../../utils/translateBasicData'
import moment from 'moment'

import 'core-js';
import './styles.css'

import { gornChain, complementChain } from '../../classes/chains';
import { DbHandler } from "../../classes/Handlers/DbHandler";
import { hideLoading, showLoading } from "../Layout/extra";




export class Home extends Component {
	radios = null;
	remainingTime = 0
	db = new DbHandler()


	state = {
		radiuses: null,
		chartType: "radial",
		pickValue: null,
		chartData: null,
		cache: null,
		date: null,
		blink: false,
		autoUpdate: false,
		updateTime: window.updatesInterval,
		meterErrors: null,
		updateInterval: null,			// the handler for update counter
		elapsedInterval: null,		// the handler for countdown counter
		now: null,
		lastHour: null,
	}


	componentDidMount = () => {
		setTimeout(() => document.querySelector(".menu-wrapper").style.opacity = 1, 0)
		this.radios = document.getElementsByName("customRadio")
	}



	stopUpdates = () => {
		clearTimeout(this.state.updateInterval);
		clearInterval(this.state.elapsedInterval);
		document.querySelector('title').textContent = "Разгар горна ДП-4";
		// console.log("home - interval cleared");//////////////
	}



	handleDate = date => {
		showLoading()
		this.setState({ date: null })

		//translateBasicData()

		let dateError = ""
		moment(date) > moment() && (dateError = "Извините, предвидеть я не умею...")
		moment(date) < moment("2020-02-15") && (dateError = "Самая ранняя доступная дата - это 15.02.2020")

		if (dateError) {
			alert(dateError);
			hideLoading()
			return;
		}

		for (let r of this.radios)
			r.checked = false;

		//////////////////////////////////////////////////////////// cache
		if (this.state.cache && this.state.cache.has(date)) {
			const cache = this.state.cache.get(date);
			console.log("gorn from cache");

			this.setState({
				meterErrors: cache.errors,
				radiuses: cache.radiuses,
				net1150: cache.net1150,
				date: date,
				//blink: true,
				autoUpdate: new Date().toISOString().slice(0, 10) === date,
			});

			hideLoading()
			return;
		}

		////////////////////////////////////////////// get data and apply error handler
		let date1day = moment(date).add(-1, "day").toISOString(true).slice(0, 10)

		this.db.getIntervalAsync(date1day, date)
			.then(async data => await gornChain.handle(data))
			.then(radiuses => {
				this.stopUpdates();

				let cache = {};
				cache[date] = { radiuses: {} }

				Object.keys(radiuses).forEach(key => key !== "net1150" && key !== "errors" && (cache[date]["radiuses"][key] = radiuses[key]))
				cache[date]["net1150"] = radiuses["net1150"]
				cache[date]["errors"] = radiuses["errors"]

				this.setState({
					meterErrors: cache[date].errors,
					radiuses: cache[date].radiuses,
					net1150: cache[date].net1150,
					cache: this.state.cache ? this.state.cache.set(date, cache[date]) : new Map(Object.entries(cache)),
					date: date,
					//blink: true,
					autoUpdate: new Date().toISOString(true).slice(0, 10) === date,
				}, () => hideLoading())
			})
			.catch(error => {
				console.error(error)
				hideLoading()
				alert("Запрос не удался. Попробуйте снова")
			})
	}



	handlePick = which => {
		this.stopUpdates();
		const query = document.getElementById(`label${which}`).textContent.replace(/\s/, ' ').split(' ');
		const pickType = query[0];
		const pickValue = +which;

		const cachedData = this.state.cache.get(this.state.date);
		const errors = this.state.meterErrors

		const chartType = pickType === "Луч" ? "vertical" : "radial"

		if (this.state.autoUpdate) {
			this.setState({
				chartType,
				pickValue,
				chartData: chartType !== this.state.chartType ? null : this.state.chartData
			}, _ => this.update(chartType, pickValue))
		}
		else {
			let newChartData

			if (chartType === "vertical") {
				if ("verticalCache" in cachedData && pickValue in cachedData.verticalCache) {
					newChartData = cachedData.verticalCache[pickValue];
					console.log("chart data from cache");
				}
				else {
					newChartData = pullLuch(
						this.state.radiuses,
						this.state.net1150[pickValue],
						errors,
						pickValue
					);

					if (!("verticalCache" in cachedData))
						cachedData.verticalCache = {}

					cachedData.verticalCache[pickValue] = newChartData
				}
			}
			else {
				if ("horizontCache" in cachedData && pickValue in cachedData.horizontCache) {
					newChartData = cachedData.horizontCache[pickValue];
					console.log("chart data from cache");
				}
				else {
					newChartData = pullPoyas(
						this.state.radiuses,
						errors ? errors[pickValue] : null,
						pickValue
					);

					if (!("horizontCache" in cachedData))
						cachedData.horizontCache = {}

					cachedData.horizontCache[pickValue] = newChartData; // I know this is wrong, but works faster, so..
				}
			}

			const stateTemplate = {
				chartType,
				pickValue,
				chartData: newChartData,
				meterErrors: errors,
				blink: false
			}

			this.setState(stateTemplate);
		}
	}


	update = async (chartType, pickValue) => {
		showLoading()
		let newChartData = this.state.chartData
		let newNow = this.state.now
		let newLastHour = this.state.lastHour
		let newMeterErrors = this.state.meterErrors
		let newElapsedInterval = this.state.elapsedInterval			///// 1s countdown counter interval handler
		let newUpdateInterval = this.state.updateInterval				///// staple update interval handler

		let error = false																				// when something was wrong to the data from server
		const timer = document.getElementById("elapsed")

		///// check if user hasn't already chosen another one
		if (pickValue === this.state.pickValue && chartType === this.state.chartType) {
			timer && (timer.innerText = `Обновление...`)

			try {
				const data = await this.db.getInstantAsync()		///// the first long procedure
				// now we got two sets: `now` and `now1hour` >>> data

				timer && (timer.innerText = `Данные получены...`)

				// flip object keys for errorHandler to retrieve data correctly
				const radiuses = await gornChain.handle({ now1hour: data.now1hour, now: data.now })		///// the second long procedure

				///// check again
				if (pickValue === this.state.pickValue && chartType === this.state.chartType) {
					this.stopUpdates()
					this.remainingTime = this.state.updateTime - 1

					const net1150 = radiuses.net1150;

					newChartData = chartType === "radial"
						? pullPoyas(radiuses, radiuses.errors ? radiuses.errors[pickValue] : null, pickValue)
						: pullLuch(radiuses, net1150[pickValue], radiuses.errors, pickValue)

					newNow = await complementChain.handle(data.now)
					newLastHour = await complementChain.handle(data.now1hour)
					radiuses.errors && (newMeterErrors = { ...radiuses.errors })

					newUpdateInterval = setTimeout(() => this.update(chartType, pickValue), this.state.updateTime * 1000)
					newElapsedInterval = setInterval(() => {
						if (timer) {
							timer.innerText = this.remainingTime ? `Обновление через ${this.remainingTime} c.` : `Обновление...`
							document.querySelector('title').textContent = `Разгар горна ДП-4: ${this.remainingTime} c.`
							this.remainingTime && --this.remainingTime
						}
					}, 1000)
				}
				else
					return
			}
			catch (err) {
				console.error(err)
				error = true
				timer && (timer.innerText = `Ошибка в полученных данных...`)
				return
			}
		}
		else
			return

		this.setState({
			chartType,
			pickValue,
			chartData: newChartData,
			now: newNow,
			lastHour: newLastHour,
			meterErrors: newMeterErrors,
			updateInterval: newUpdateInterval,
			elapsedInterval: newElapsedInterval,
			blink: false,
		}, () => {
			if (!timer) {	////// right after first update (timer was hidden before so reinit backcount)
				const newTimer = document.getElementById("elapsed");
				newTimer.textContent = "Данные отображены..."
				const newElapsedInterval = setInterval(() => {
					newTimer.innerText = this.remainingTime ? `Обновление через ${this.remainingTime} c.` : `Обновление...`
					document.querySelector('title').textContent = `Разгар горна ДП-4: ${this.remainingTime} c.`
					this.remainingTime && --this.remainingTime
				}, 1000)
				this.setState({ elapsedInterval: newElapsedInterval })
			}
			else
				!error && timer && (timer.innerText = `Данные отображены...`)
			hideLoading()
		})
	}


	autoClick = async e => {
		this.stopUpdates()
		this.setState({
			updateInterval: null,
			autoUpdate: e.target.checked
		}, () => this.state.autoUpdate && this.update(this.state.chartType, this.state.pickValue))
	}


	componentDidUpdate = (prevProps, prevState) => {
		if (prevState.chartData !== this.state.chartData) {
			this.state.chartData && (document.getElementById("chartfield").style.opacity = 1)
		}
	}

	componentWillUnmount = () => this.stopUpdates();



	///////////////// RENDER
	render() {
		//console.log("home-render", this.state);////////////////////////

		return (
			<div className="d-flex flex-row" >
				<div className="menu-wrapper">
					<DateGroup id="date" hint="Дата" onChange={this.handleDate} btnHint="Запросить" />
					<Menu enabled={!!this.state.date} handle={this.handlePick} blink={this.state.blink} />
				</div>
				<div className="devider"></div>
				<div className="d-flex" id="chartfield">
					{this.state.chartData && this.state.date === moment().toISOString(true).slice(0, 10) &&
						<AutoUpdate onClick={this.autoClick} checked={this.state.autoUpdate} />}
					{this.state.chartData && (this.state.chartType === "radial"
						? <RadialChart chartData={this.state.chartData} date={this.state.date} />
						: <VerticalChart chartData={this.state.chartData} date={this.state.date} />)}
					{this.state.meterErrors && <ErrorsTable meterErrors={this.state.meterErrors} />}
					<LastHourTable
						now={this.state.now}
						lastHour={this.state.lastHour}
						visible={this.state.updateInterval && this.state.autoUpdate}
						pickValue={this.state.pickValue}
						chartType={this.state.chartType}
					/>
				</div>
			</div>
		);
	}
}
