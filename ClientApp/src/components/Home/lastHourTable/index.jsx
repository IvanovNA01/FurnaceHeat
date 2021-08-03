import React, { Component } from 'react'
import Toast from 'react-bootstrap/Toast'
import Badge from 'react-bootstrap/Badge'
import { Table } from 'react-bootstrap'
import './styles.css'


export class LastHourTable extends Component {


	state = {
		bodyVisible: false,
		visible: false,
		errors: [],
		count: 1,
		rows: [],
	}


	componentDidUpdate = prevProps => {
		if (prevProps !== this.props && this.props.now) {
			const rows = []
			const errors = []

			let keyCounter = 0

			if (this.props.chartType === "radial") {
				const now = this.props.now[this.props.pickValue]
				const lastHour = this.props.lastHour[this.props.pickValue]

				Object.keys(now).forEach(luch => {
					Object.keys(now[luch]).forEach(radius => {
						const currentNow = Math.round(now[luch][radius])
						const currentLast = Math.round(lastHour[luch][radius])
						const status = this.getStatus(currentNow, currentLast)

						status === "Превышение" && errors.push(`Превышен рост температуры: ${luch} луч, радиус ${radius}`)
						status === "Критично" && errors.push(`Критическая температура: ${luch} луч, радиус ${radius}`)

						rows.push(<tr key={keyCounter++} className={status === "Норма" ? "text-secondary" : status === "Критично" ? "text-danger" : "text-warning"}>
							<td width="10%" className="shaded-cell">{luch}</td>
							<td width="20%" className="shaded-cell">{radius}</td>
							<td width="20%">{currentNow}</td>
							<td width="20%">{currentLast}</td>
							<td width="30%" className="shaded-cell">{status}</td>
						</tr>)
					})
				})

			}
			else if (this.props.chartType === "vertical") {
				const luch = this.props.pickValue + ''

				Object.keys(this.props.now).forEach(poyas => {
					if (isNaN(poyas))
						return

					Object.keys(this.props.now[poyas][luch]).forEach(radius => {
						const now = Math.round(this.props.now[poyas][luch][radius])
						const lastHour = Math.round(this.props.lastHour[poyas][luch][radius])
						const status = this.getStatus(now, lastHour)

						status === "Превышение" && errors.push(`Превышен рост температуры: ${poyas} пояс, радиус ${radius}`)
						status === "Критично" && errors.push(`Критическая температура: ${poyas} пояс, радиус ${radius}`)

						rows.push(<tr key={keyCounter++} className={status === "Норма" ? "text-secondary" : status === "Критично" ? "text-danger" : "text-warning"}>
							<td width="10%" className="shaded-cell">{poyas}</td>
							<td width="20%" className="shaded-cell">{radius}</td>
							<td width="20%">{now}</td>
							<td width="20%">{lastHour}</td>
							<td width="30%" className="shaded-cell">{status}</td>
						</tr>)
					})
				})
			}

			this.setState({
				rows,
				visible: errors.length > 0,
				errors: errors,
				count: errors.length,
				bodyVisible: this.state.bodyVisible
			})
		}
	}


	getStatus = (now, ago) => {
		return now > 90000
			? "Критично"
			: Math.abs(now - ago) > 10 || now > 3000
				? "Превышение"
				: "Норма"
	}


	toggleBody = () => this.state.count && this.setState({ bodyVisible: !this.state.bodyVisible })


	////////////////////////////////////////////////// RENDER
	render() {
		//console.log(this.state)

		return <div className={this.props.visible ? "table-visible" : "table-invisible"}>
			<Table hover size="sm" className="last-hour-table">
				<thead>
					<tr>
						<th width="10%" className="shaded-cell">{this.props.chartType === "radial" ? "ЛУЧ" : "ПОЯС"}</th>
						<th width="20%" className="shaded-cell">РАДИУС</th>
						<th width="20%">ТЕКУЩАЯ</th>
						<th width="20%">ПРЕД.ЧАС</th>
						<th width="30%" className="shaded-cell">СТАТУС</th>
					</tr>
				</thead>
				<tbody>{this.state.rows}</tbody>
			</Table>

			<div className="last-hour-wrapper" aria-live="polite" aria-atomic="true">
				<Toast show={this.state.visible} onClose={() => this.setState({ visible: false })} className="toast-warning">
					<Toast.Header className="warning-header" onClick={() => this.toggleBody()}>
						<strong className="mr-auto">Предупреждения</strong>
						<Badge variant="warning">{this.state.count}</Badge>
					</Toast.Header>
					<Toast.Body className={this.state.bodyVisible ? "warning-body" : "toast-body-hidden"}>
						{this.state.errors.map(er => <div key={er}>{er}</div>)}
					</Toast.Body>
				</Toast>
			</div>
		</div>
	}
}