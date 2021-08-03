import React, { Component } from 'react'
import Toast from 'react-bootstrap/Toast'
import Badge from 'react-bootstrap/Badge'
import { Table } from 'react-bootstrap'
import moment from 'moment'
import './styles.css'


export class ErrorsTable extends Component {

	constructor(props) {
		super(props)

		const objErrors = this.transpileRawErrors(props.meterErrors)

		this.state = {
			bodyVisible: false,
			visible: true,
			errors: objErrors.errors,
			count: objErrors.errors.length,
			nonActive: objErrors.nonActive,
			active: objErrors.active,
		}
	}


	transpileRawErrors = (rawErrors) => {
		let errors = []
		Object.keys(rawErrors).forEach(poyas => {
			Object.keys(rawErrors[poyas]).forEach(luch => {
				Object.keys(rawErrors[poyas][luch]).forEach(radius => {
					errors.push(rawErrors[poyas][luch][radius])
				})
			})
		})

		errors.sort((a, b) => new Date(a.date) < new Date(b.date) ? 1 : -1)
		const nonActive = errors.filter(er => er.nonActive).length
		const active = errors.length - nonActive

		return {
			errors,
			nonActive,
			active
		}
	}


	toggleBody = () => this.state.count && this.setState({ bodyVisible: !this.state.bodyVisible })


	componentDidUpdate(prevProps) {
		if (prevProps.meterErrors !== this.props.meterErrors) {
			const newErrors = this.transpileRawErrors(this.props.meterErrors)

			this.setState({
				errors: newErrors.errors,
				count: newErrors.errors.length,
				nonActive: newErrors.nonActive,
				active: newErrors.active,
			})
		}
	}


	render() {
		//console.log(this.state.errors)
		const activeClass = this.state.active ? "danger" : "secondary"

		return <>
			<div className="toast-bring-back" onClick={() => this.setState({ visible: true, bodyVisible: false })}>Показать панель неисправностей</div>
			<div className="toast-wrapper" aria-live="polite" aria-atomic="true">
				<Toast show={this.state.visible} onClose={() => this.setState({ visible: false, bodyVisible: false })} className="toast-main">
					<Toast.Header className="malfunctions-header" onClick={() => this.toggleBody()}>
						<strong className={this.state.active ? "mr-auto danger" : "mr-auto"}>Неисправности</strong>
						<span className={activeClass}>Активные: <Badge variant={activeClass}>{this.state.active}</Badge>&nbsp;&nbsp;</span>
						<span>Всего: <Badge variant="secondary">{this.state.count}</Badge></span>
					</Toast.Header>
					<Toast.Body className={this.state.bodyVisible ? "toast-body" : "toast-body-hidden"}>
						<Table hover size="sm">
							<thead>
								<tr>
									<th width="35%">Дата</th>
									<th width="20%">Пояс</th>
									<th width="10%">Луч</th>
									<th>Радиус</th>
									<th>Значение</th>
								</tr>
							</thead>
							<tbody>{this.state.errors.map(er => {
								return <tr key={er.poyas + er.luch + er.radius} className={er.nonActive ? "non-active-error" : "active-error"} >
									<td width="41%" title={`Время первого обнаружения (не появления)`} style={{ cursor: "help" }} >{moment(er.date).format("DD.MM.YYYY HH:mm")}</td>
									<td>{er.poyas}</td>
									<td>{er.luch}</td>
									<td>{er.radius}</td>
									<td>{Math.round(er.value)}</td>
								</tr>
							})}</tbody>
						</Table>
					</Toast.Body>
				</Toast>
			</div>
		</>
	}
}