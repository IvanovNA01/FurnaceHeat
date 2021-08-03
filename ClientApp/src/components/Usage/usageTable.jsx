import moment from 'moment'
import React, { useEffect, useState } from 'react'
import Badge from 'react-bootstrap/Badge'
import { Table } from 'react-bootstrap'
import './styles.css'


export const UsageTable = ({
	data,
	visible
}) => {

	const uniqueIps = [...new Set(data.map(item => item.ip))].length
	const uniqueMethods = [...new Set(data.map(item => item.method))].length

	const format = /[`!@#$%^&*_+\-={};'"\\|,.<>/?~]/;
	const danger = `bg-caution`

	// выдает отсортированные данные
	const countData = (field, asc) =>
		data
			.concat()
			.sort(predicateProvider(field, asc))
			.map((row, index) => {
				const valid = !format.test(row.method)

				return <tr key={index}>
					<td width="10%" className={`shaded ` + (valid ? `` : danger)}>{moment(row.date).format("DD.MM.YYYY")}</td>
					<td width="7%" className={valid ? `` : danger}>{moment(row.date).format("HH:mm")}</td>
					<td width="13%" className={`accent ` + (valid ? `` : danger)}>{row.ip}</td>
					<td width="30%" className={valid ? `` : danger}>{row.method}</td>
					<td width="40%" className={valid ? `` : danger}>{row.params}</td>
				</tr>
			})


	const headerClick = (field) => {
		const asc = field === state.field ? !state.asc : state.asc
		const dataToDisplay = countData(field, asc)

		const headers = document.querySelectorAll(".badge")
		headers.forEach(el => el.classList.remove("badge-desc"))
		headers.forEach(el => el.classList.remove("badge-asc"))

		const orderClass = asc ? "badge-asc" : "badge-desc"

		switch (field) {
			case "date": headers[0].classList.add(orderClass); break;
			case "ip": headers[1].classList.add(orderClass); break;
			case "method": headers[2].classList.add(orderClass); break;
			default: break;
		}

		setState({ field, dataToDisplay, asc })
	}


	const [state, setState] = useState({
		field: "date",												// начальное поле сортировки
		asc: false,
		dataToDisplay: countData("date", false)
	})


	useEffect(() => {
		headerClick("date")
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])


	useEffect(() => {
		if (data.length === 0)
			return

		setState({ ...state, dataToDisplay: countData(state.field, state.asc) })
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [data])



	return <Table hover size="sm" className={"usage-table " + (visible ? "table-visible" : "table-hidden")}>
		<thead>
			<tr>
				<th width="10%" onClick={() => headerClick("date")}>ДАТА<Badge>{data.length}</Badge></th>
				<th width="7%" onClick={() => headerClick("date")}>ВРЕМЯ</th>
				<th width="13%" onClick={() => headerClick("ip")}>IP<Badge>{uniqueIps}</Badge></th>
				<th width="30%" onClick={() => headerClick("method")}>АДРЕС ОБРАЩЕНИЯ<Badge>{uniqueMethods}</Badge></th>
				<th width="40%">ПАРАМЕТРЫ ЗАПРОСА</th>
			</tr>
		</thead>
		<tbody>{state.dataToDisplay}</tbody>
	</Table >
}


const predicateProvider = (field, asc) => {
	field === "ip" && (asc = !asc)

	return (a, b) =>
		a[field] > b[field]
			? asc ? - 1 : 1
			: a[field] < b[field]
				? asc ? 1 : -1
				: 0
}