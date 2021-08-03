import React, { Component } from 'react'
import { Card, Accordion } from 'react-bootstrap'
import { Checkbox } from '../../templates'

import HeatFlow from "./HeatFlow"
import Temps from "./Temps"
import WallWidth from "./WallWidth"



export class TrendMenu extends Component {

	state = {
		cardHeaderEls: null,
		forecastInputEl: null,
		chBoxesTemp: []
	}



	componentDidMount = () => {
		this.setState({
			cardHeaderEls: document.querySelectorAll(".header-title"),
			forecastInputEl: document.querySelector(".input-group-sm.hidden"),
		})
	}
	componentDidUpdate = (prevProps, prevState) => {
		if (prevProps.chBoxesTemp !== this.props.chBoxesTemp) {
			const chBoxes = Object.keys(this.props.chBoxesTemp)

			const chBoxesTemp = chBoxes
				.map(luch => this.accordionItem({ luch: luch, radiuses: this.props.chBoxesTemp[luch], half: chBoxes.length > 16 }))

			this.setState({ chBoxesTemp })
		}
	}



	static clearRadios = () => document.getElementsByName("customRadio").forEach(r => r.checked = false)
	headerClick = e => {
		///////////////////////////////////// close forecast panel
		const isForecastInputHidden = this.state.forecastInputEl.classList.contains("hidden")
		!isForecastInputHidden && this.state.forecastInputEl.classList.toggle("hidden")


		//////////// toggle active headers class
		this.state.cardHeaderEls.forEach(el => el.classList.remove("active"))
		e.target.classList.add("active")


		////////////////////////// switch handler
		this.props.clearAll()

		const to = e.target.textContent.includes("Толщина стенки") || e.target.textContent.includes("Прогноз")
			? "Толщина стенки"
			: e.target.textContent

		this.props.switchHandler(to)
	}
	accordionItem = props =>
		<Card className={"temp-luchi-card " + (props.half ? "half-sized" : "")} key={'rt' + props.luch}>
			<Accordion.Toggle as={Card.Header} variant="link" eventKey={props.luch} id={`tluch${props.luch}`}>Луч {props.luch}</Accordion.Toggle>
			<Accordion.Collapse eventKey={props.luch}>
				<Card.Body>{props.radiuses.map(r => <Checkbox key={`rt${r}`} id={`l${props.luch}-r${r}`} hint={`R${r}`} onChange={this.props.clickChBox} />)}</Card.Body>
			</Accordion.Collapse>
		</Card>




	//////////////////////// render
	render() {
		//console.log("trend-menu-render")

		return <Accordion defaultActiveKey="100" className="shadow-lg trend-menu">
			<WallWidth
				headerClick={this.headerClick}
				forecastPossible={this.props.forecastPossible}
				forecastClick={this.props.forecastClick}
				clearLuchi={this.props.clearLuchi}
				clickRadio={this.props.clickRadio}
				clickChBox={this.props.clickChBox}
			/>
			<Temps
				headerClick={this.headerClick}
				clickRadio={this.props.clickRadio}
				clearLuchi={this.props.clearLuchi}
				chBoxesTemp={this.state.chBoxesTemp}
			/>
			<HeatFlow
				headerClick={this.headerClick}
				clearLuchi={this.props.clearLuchi}
				clickRadio={this.props.clickRadio}
				clickChBox={this.props.clickChBox}
			/>
		</Accordion >
	}
}