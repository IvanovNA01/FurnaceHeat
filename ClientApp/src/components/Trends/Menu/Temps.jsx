import { Card, Accordion, OverlayTrigger, Tooltip } from 'react-bootstrap'
import { Radio } from '../../templates'


const TempsPane = (props) => {

	return <Card className="card-no-radius">
		<Accordion.Toggle as={Card.Header} eventKey="101" className="card-header-sm header-title" onClick={e => props.headerClick(e)}>Температуры</Accordion.Toggle>
		<Accordion.Collapse eventKey="101">
			<Card.Body className="trend-wrapper">
				<Card>
					<Card.Header className="card-header-sm muted small card-no-radius text-center" style={{ backgroundColor: "white" }}>Пояс</Card.Header>
					<div className="trend-radio-wrapper">
						<Radio classList="mylink" onChange={() => { props.clickRadio("t1") }} id="t1" hint="1 пояс" />
						<Radio classList="mylink" onChange={() => { props.clickRadio("t3") }} id="t3" hint="3 пояс" />
						<Radio classList="mylink" onChange={() => { props.clickRadio("t4") }} id="t4" hint="4 пояс" />
						<Radio classList="mylink" onChange={() => { props.clickRadio("t5") }} id="t5" hint="5 пояс" />
						<Radio classList="mylink" onChange={() => { props.clickRadio("t6") }} id="t6" hint="6 пояс" />
						<Radio classList="mylink" onChange={() => { props.clickRadio("t7") }} id="t7" hint="7 пояс" />
						<Radio classList="mylink" onChange={() => { props.clickRadio("t8") }} id="t8" hint="8 пояс" />
						<Radio classList="mylink" onChange={() => { props.clickRadio("t9") }} id="t9" hint="9 пояс" />
						<Radio classList="mylink" onChange={() => { props.clickRadio("t10") }} id="t10" hint="10 пояс" />
						<Radio classList="mylink" onChange={() => { props.clickRadio("t11") }} id="t11" hint="11 пояс" />
						<Radio classList="mylink" onChange={() => { props.clickRadio("t12") }} id="t12" hint="12 пояс" />
					</div>
				</Card>
				<Card style={{ minWidth: "177px" }}>
					<OverlayTrigger key="2" placement="right" overlay={<Tooltip>Сброс выбора</Tooltip>}>
						<Card.Header
							className="card-header-sm muted small card-no-radius luchi"
							style={{ backgroundColor: "white" }}
							onClick={props.clearLuchi}
						>Отображаемые лучи (0)</Card.Header>
					</OverlayTrigger>
					<div className="temp-checkbox-wrapper">
						<Accordion defaultActiveKey="1" className="trend-luchi-accordion">
							{props.chBoxesTemp}
						</Accordion>
					</div>
				</Card>
			</Card.Body>
		</Accordion.Collapse>
	</Card>
}

export default TempsPane
