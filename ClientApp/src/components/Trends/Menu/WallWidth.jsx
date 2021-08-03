import React from "react"
import { Card, Accordion, OverlayTrigger, Tooltip } from 'react-bootstrap'
import { Checkbox } from '../../templates'
import { Radio } from '../../templates'


const WallWidthPane = (props) => {
	const chBoxesWall = Array
		.from({ length: 32 }, (_, i) => i + 1)
		.map(num => <Checkbox key={num} id={`Луч ${num}`} hint={num} onChange={props.clickChBox} classList="mylink" />)


	return <Card className="card-no-radius">
		<Accordion.Toggle as={Card.Header} eventKey="100" className="card-header-sm" >
			<div className="header-title active" onClick={e => props.headerClick(e)}>Толщина стенки</div>
			<div className={"input-group input-group-sm " + (props.forecastPossible ? "" : "hidden")} onClick={e => e.stopPropagation()}>
				<div className="input-group-prepend">
					<span className="input-group-text">Прогноз, суток</span>
				</div>
				<input
					type="number"
					id="forecastCount"
					className="form-control"
					min="1"
					step="1"
					defaultValue="1"
				/>
				<div className="input-group-append">
					<button onClick={() => { props.forecastClick(document.getElementById("forecastCount").value) }} className="btn btn-outline-secondary" type="button" id="button-addon2">ПОКАЗАТЬ</button>
				</div>
			</div>
		</Accordion.Toggle>
		<Accordion.Collapse eventKey="100">
			<Card.Body className="trend-wrapper">
				<Card>
					<OverlayTrigger key="1" placement="left" overlay={<Tooltip>Сброс выбора</Tooltip>}>
						<Card.Header
							className="card-header-sm muted small card-no-radius luchi"
							style={{ backgroundColor: "white" }}
							onClick={() => props.clearLuchi()}
						>Отображаемые лучи (0)</Card.Header>
					</OverlayTrigger>
					<div className="trend-checkbox-wrapper">{chBoxesWall}</div>
				</Card>
				<Card>
					<Card.Header className="card-header-sm muted small card-no-radius text-center" style={{ backgroundColor: "white" }}>Тип</Card.Header>
					<div className="trend-radio-wrapper">
						<Radio onChange={() => props.clickRadio("r0")} id="rp0" hint="hR=0" />
						<Radio onChange={() => props.clickRadio("r1668")} id="r1668" hint="hR=1668" />
						<Radio onChange={() => props.clickRadio("r3518")} id="r3518" hint="hR=3518" />
						<Radio onChange={() => props.clickRadio("r6")} id="r6" hint="6 пояс" />
						<Radio onChange={() => props.clickRadio("r7")} id="r7" hint="7 пояс" />
						<Radio onChange={() => props.clickRadio("r8")} id="r8" hint="8 пояс" />
						<Radio onChange={() => props.clickRadio("r9")} id="r9" hint="9 пояс" />
						<Radio onChange={() => props.clickRadio("r10")} id="r10" hint="10 пояс" />
						<Radio onChange={() => props.clickRadio("r11")} id="r11" hint="11 пояс" />
						<Radio onChange={() => props.clickRadio("r12")} id="r12" hint="12 пояс" />
					</div>
				</Card>
			</Card.Body>
		</Accordion.Collapse>
	</Card>
}

export default WallWidthPane
