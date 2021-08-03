import React, { Component } from 'react'
import { DatesGroup } from '../templates'
import { R1150Chart } from './Chart'
import { TrendMenu } from './Menu'
import { RWallHandler } from './StateHandlers'
import moment from 'moment'
import './styles.css'




export class Trends extends Component {

	stateHandler


	state = {
		eDateEl: null,
		chartData: null,
		blink: false,
		error: null,
		chBoxesTemp: [],
		chartVisible: false
	}



	componentDidMount = () => {
		setTimeout(() => document.querySelector(".menu-wrapper").style.opacity = 1, 0)

		this.stateHandler = new RWallHandler(this)

		this.setState({
			blink: true,
			bDateEl: document.getElementById("bDate"),
			eDateEl: document.getElementById("eDate"),
		})
	}


	switchHandler = to => this.stateHandler.switchHandler(to)

	handleRadio = value => this.stateHandler.handleRadio(value)

	handleCheckbox = e => this.stateHandler.handleCheckbox(e)

	clearAll = () => this.stateHandler.clearAll()

	clearLuchi = () => this.stateHandler.clearLuchi()

	handleDate = which => this.stateHandler.handleDate(which)



	componentDidUpdate = (prevProps, prevState) => {
		if (prevState.blink !== this.state.blink) {
			this.state.blink && document.querySelectorAll(".mylink").forEach(b => b.classList.add("blink_me"))
			!this.state.blink && document.querySelectorAll(".mylink").forEach(b => b.classList.remove("blink_me"))
		}

		if (this.state.error) {
			TrendMenu.clearRadios()
			alert(this.state.error)
			this.setState({ error: null })
		}
	}



	//////////////////////////////// RENDER
	render() {
		//console.log(this.state)////////////////////////////////////////////


		return (
			<div className="d-flex flex-row">
				<div className="menu-wrapper">
					<DatesGroup
						bDate={moment().subtract(14, 'day').toISOString(true).slice(0, 10)}
						eDate={moment().subtract(1, 'day').toISOString(true).slice(0, 10)}
						keyDown={this.handleDate}
					/>
					<TrendMenu
						clickRadio={this.handleRadio}
						chBoxesTemp={this.state.chBoxesTemp}
						clickChBox={this.handleCheckbox}
						switchHandler={this.switchHandler}
						clearLuchi={this.clearLuchi}
						clearAll={this.clearAll}
						forecastClick={sut => this.stateHandler.forecastClick(sut)}
						forecastPossible={this.state.chartVisible
							&& this.state.chartData.chartType === "r1150"
							&& this.state.eDateEl.value === moment().subtract(1, "day").format("YYYY-MM-DD")}
					/>
				</div>
				<div className="devider"></div>
				<div id="chartfield" className={this.state.chartVisible ? "visible" : "hidden"} >
					{this.state.chartData && <R1150Chart chartData={this.state.chartData} />}
				</div>
			</div>
		)
	}
}