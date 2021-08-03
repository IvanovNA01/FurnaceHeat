import React, { Component } from 'react'
import { DateListGroup } from '../templates'
import { DbHandler } from "../../classes/Handlers/DbHandler"
import { showLoading, hideLoading } from "../Layout/extra"
import { UsageTable } from "./usageTable"
import moment from 'moment'
import './styles.css'


export class Usage extends Component {

	dbHandler = new DbHandler()
	title = null

	state = {
		ips: [],
		usageData: []
	}


	componentDidMount = _ => {
		this.title = document.querySelector(".title")
		this.title.textContent = ""
		setTimeout(() => document.querySelector(".menu-wrapper").style.opacity = 1, 0)

		this.dbHandler.getIpsAsync()
			.then(data => this.setState({ ips: data }))
			.catch(error => console.error(error))
	}


	handleDate = date => {
		if (!this.validateDate(date))
			return

		showLoading()
		this.handleDbResponseAsync(this.dbHandler.getUsageForDateAsync(date))
	}

	handleIp = ip => {
		showLoading()
		this.handleDbResponseAsync(this.dbHandler.getUsageForIpAsync(ip))
	}

	handleAll = _ => {
		const dt = document.getElementById("date")
		const ip = document.getElementById("listIp")

		if (!dt || !ip || !this.validateDate(dt.value))
			return

		showLoading()
		this.handleDbResponseAsync(this.dbHandler.getUsageForAsync(dt.value, ip.value))
	}


	/////////////////////////////////// RENDER
	render() {
		//console.log(this.state.errors)

		return <div className="d-flex flex-row" >
			<div className="menu-wrapper">
				{this.state.ips.length
					? <>
						<DateListGroup
							dateId="date"
							date={new Date().toISOString(true).slice(0, 10)}
							dateHint="Дата"
							dateBtnHint="По дате"
							dateKeyDown={date => this.handleDate(date)}
							listHint="IP"
							listBtnHint="По IP"
							listId="listIp"
							listItems={this.state.ips}
							listKeyDown={ip => this.handleIp(ip)}
						/>
						<button className="btn btn-sm btn-outline-dark usage-btn" onClick={_ => this.handleAll()}>ПО ВСЕМ</button>
					</>
					: <div className="display-5 text-muted">Нет данных</div>}
			</div>
			<div className="devider"></div>
			<div className="usage-wrapper">
				<UsageTable
					data={this.state.usageData}
					visible={this.state.usageData.length > 0}
				/>
			</div>
		</div>
	}



	//////////////////////////////////// private section
	validateDate = date => {
		let dateError = ""
		moment(date) > moment() && (dateError = "Извините, предвидеть я не умею...")
		moment(date) < moment("2020-02-15") && (dateError = "Самая ранняя доступная дата - это 15.02.2020")

		if (dateError) {
			alert(dateError);
			hideLoading();
			return false;
		}
		return true
	}

	async handleDbResponseAsync(promise) {
		promise
			.then(data => {
				hideLoading()
				this.setState({ usageData: data })
			})
			.catch(error => {
				hideLoading()
				console.error(error)
				alert("Запрос не удался. Попробуйте снова")
			})
	}
}