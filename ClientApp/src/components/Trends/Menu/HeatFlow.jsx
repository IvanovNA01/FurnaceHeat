import React from "react"
import { Card, Accordion, OverlayTrigger, Tooltip } from 'react-bootstrap'
import { Checkbox } from '../../templates'
import { Radio } from '../../templates'


const HeatFlow = (props) => {
	const chBoxesWall = Array
		.from({ length: 32 }, (_, i) => i + 33)
		.map(num => <Checkbox key={num} id={`Луч ${num}`} hint={num - 32} onChange={props.clickChBox} classList="mylink" />)


	return <Card className="card-no-radius">
		<Accordion.Toggle as={Card.Header} eventKey="102" className="card-header-sm" >
			<div className="header-title" onClick={e => props.headerClick(e)}>Тепловые потоки</div>
		</Accordion.Toggle>
		<Accordion.Collapse eventKey="102">
			<Card.Body className="trend-wrapper">
				<Card>
					<OverlayTrigger key="1" placement="left" overlay={<Tooltip>Сброс выбора</Tooltip>}>
						<Card.Header
							className="card-header-sm muted small card-no-radius luchi"
							style={{ backgroundColor: "white" }}
							onClick={props.clearLuchi}
						>Отображаемые лучи (0)</Card.Header>
					</OverlayTrigger>
					<div className="trend-checkbox-wrapper">{chBoxesWall}</div>
				</Card>
				<Card>
					<Card.Header className="card-header-sm muted small card-no-radius text-center" style={{ backgroundColor: "white" }}>Тип</Card.Header>
					<div className="trend-radio-wrapper">
						<Radio onChange={() => props.clickRadio("r0")} id="hrp0" hint="hR=0" />
						<Radio onChange={() => props.clickRadio("r1668")} id="hr1668" hint="hR=1668" />
						<Radio onChange={() => props.clickRadio("r3518")} id="hr3518" hint="hR=3518" />
						<Radio onChange={() => props.clickRadio("r6")} id="hr6" hint="6 пояс" />
						<Radio onChange={() => props.clickRadio("r7")} id="hr7" hint="7 пояс" />
						<Radio onChange={() => props.clickRadio("r8")} id="hr8" hint="8 пояс" />
						<Radio onChange={() => props.clickRadio("r9")} id="hr9" hint="9 пояс" />
						<Radio onChange={() => props.clickRadio("r10")} id="hr10" hint="10 пояс" />
						<Radio onChange={() => props.clickRadio("r11")} id="hr11" hint="11 пояс" />
						<Radio onChange={() => props.clickRadio("r12")} id="hr12" hint="12 пояс" />
					</div>
				</Card>
			</Card.Body>
		</Accordion.Collapse>
	</Card>
}

export default HeatFlow
