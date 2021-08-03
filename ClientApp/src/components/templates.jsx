import React from 'react';
import moment from 'moment'
import { OverlayTrigger, Tooltip } from 'react-bootstrap'



export const DateGroup = props =>
	<div className="input-group input-group-sm mb-1 form-group shadow-lg date-group">
		<div className="input-group-prepend">
			<span className="input-group-text">{props.hint}</span>
		</div>
		<input
			type="date"
			required
			min={"2020-02-15"}
			className="form-control date"
			id={props.id}
			defaultValue={moment().toISOString(true).slice(0, 10)}
		//onKeyDown={e => e.key === "Enter" && props.onChange(document.getElementById(props.id).value)}
		/>
		<div className="input-group-append">
			<button className="btn btn-outline-dark"
				type="button"
				onClick={_ => props.onChange(document.getElementById(props.id).value)}
			>{props.btnHint}</button>
		</div>
	</div >;


export const AutoUpdate = props => {
	let label = props.checked
		? <label
			className="custom-control-label"
			htmlFor="customSwitch1"
			title="Отключить обновление"
		><div style={{ display: "inline-block" }} id="elapsed">Выберите необходимое сечение</div></label>
		: <label
			className="custom-control-label text-muted"
			htmlFor="customSwitch1"
			title="Включить обновление"
		>Обновление отключено</label>

	return <div className="custom-control custom-switch">
		<input
			type="checkbox"
			className="custom-control-input"
			defaultChecked={props.checked}
			id="customSwitch1"
			onClick={props.onClick}
		/>
		{label}
		<div className="small text-muted">Актуальность: {new Date().toLocaleString().slice(11, 17)}</div>
	</div>
}


export const Radio = props => {
	let label =
		<label
			id={"label" + props.id}
			className="custom-control-label mylink"
			htmlFor={props.id}
		>{props.hint}&nbsp;{props.value}</label>;

	if (props.disabled)
		label = <OverlayTrigger key={props.id} placement="top" overlay={<Tooltip id="tooltip-disabled">Пока не готов</Tooltip>}>{label}</OverlayTrigger >

	const classList = props.classList ? Array.isArray(props.classList) ? props.classList.join(' ') : props.classList : ""

	return <div
		className={"custom-control custom-radio ".concat(classList)}
		onChange={props.onChange}
		key={props.id}>
		{props.disabled
			? <input type="radio" id={props.id} name="customRadio" className="custom-control-input" disabled />
			: <input type="radio" id={props.id} name="customRadio" className="custom-control-input" />}
		{label}
	</div>
}



export const Checkbox = props => {
	let label =
		<label
			id={"label" + props.id}
			className="custom-control-label"
			htmlFor={props.id}
		>{props.hint}&nbsp;{props.value}</label>;

	if (props.disabled)
		label = <OverlayTrigger key={props.id} placement="top" overlay={<Tooltip id="tooltip-disabled">Пока не готов</Tooltip>}>{label}</OverlayTrigger >

	const classList = props.classList ? Array.isArray(props.classList) ? props.classList.join(' ') : props.classList : ""

	return <div
		className={"custom-control custom-checkbox ".concat(classList)}
		key={props.id}
		onChange={props.onChange}>
		{props.disabled
			? <input type="checkbox" id={props.id} name="customCheckbox" className="custom-control-input" disabled />
			: <input type="checkbox" id={props.id} name="customCheckbox" value={props.id} className="custom-control-input chbox" />}
		{label}
	</div>
}


const SimpleDate = props => {

	return <div className="input-group input-group-sm form-group shadow-lg">
		<div className="input-group-prepend">
			<span className={props.hintClass ? props.hintClass + " input-group-text" : "input-group-text"}>{props.hint}</span>
		</div>
		<input
			type="date"
			required
			className="form-control date input-trend"
			id={props.id}
			defaultValue={props.date}
			//max={props.date}
			min={"2020-02-15"}
			onKeyDown={e => e.preventDefault()}
			onChange={props.keyDown}
		/>
	</div>
}


export const DatesGroup = props => {
	return <div className="date-group">
		<div style={{ width: "100%" }}>
			<SimpleDate date={props.bDate} hint="Дата начала" id="bDate" keyDown={() => props.keyDown("begin")} />
			<SimpleDate date={props.eDate} hint="Дата окончания" id="eDate" keyDown={() => props.keyDown("end")} />
		</div>
	</div>
}


const SimpleList = props => {
	return <div className="input-group input-group-sm mb-0 shadow-lg">
		<div className="input-group-prepend">
			<span className={props.classList ? props.classList + " input-group-text" : "input-group-text"}>{props.hint}</span>
		</div>
		<select className="custom-select" id={props.id}>
			{props.items.map((item, index) => <option value={item} key={item + index}>{item}</option>)}
		</select>
		<div className="input-group-append">
			<button className="btn btn-outline-dark"
				type="button"
				onClick={_ => props.onChange(document.getElementById(props.id).value)}
			>{props.btnHint}</button>
		</div>
	</div>
}


/**
 * date and list below
 * @param {object} props dateId, date, dateHint, dateKeyDown(), listHint, listId, listItems, listKeyDown(), listClassList, dateClassList
 */
export const DateListGroup = props => {
	return <div className="dates-list-group">
		<DateGroup id={props.dateId} date={props.date} hint={props.dateHint} onChange={date => props.dateKeyDown(date)} btnHint={props.dateBtnHint} />
		<SimpleList hint={props.listHint} id={props.listId} items={props.listItems} onChange={ip => props.listKeyDown(ip)} btnHint={props.listBtnHint} />
	</div>
}