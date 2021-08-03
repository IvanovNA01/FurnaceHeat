import React, { Component } from 'react';
import { Card, Nav } from 'react-bootstrap';
import { Radio } from '../templates';



export class Menu extends Component {

	state = {
		content: "",
	}


	componentDidMount = () => this.toggleState("cross")


	toggleState = mode => {
		document.getElementsByName("customRadio").forEach(r => r.checked = false)

		const chartFiled = document.getElementById("chartField")
		!!chartFiled && (chartFiled.style.opacity = 0);

		const onChange = event => this.props.handle(+event.target.id);

		let content = mode === "cross"
			? <div className="radio-wrapper">
				{[...Array.from(Array(10), (_, i) => i + 3)].map(a =>
					Radio({ id: a, value: a, onChange: onChange, hint: "Пояс" }))}
			</div>

			: <div className="radio-wrapper">
				{[...Array.from(Array(32), (_, i) => i + 1)].map(a =>
					Radio({ id: a, value: a, onChange: onChange, hint: "Луч" }))}
			</div>

		this.setState({ content: content });
	}



	componentDidUpdate = oldProps => {
		if (this.props.blink && this.props.enabled) {
			for (let l of document.getElementsByClassName("mylink")) {
				l.classList.remove("blink_me")
				setTimeout(() => l.classList.add("blink_me"), 0)
			}
		}

		if (oldProps.blink && !this.props.blink) {
			for (let l of document.getElementsByClassName("mylink"))
				l.classList.remove("blink_me")
		}
	}


	//////////////////// RENDER
	render() {
		let style = this.props.enabled
			? { opacity: "1", transition: "all 0.5s ease-in", marginTop: ".2rem" }
			: { opacity: "0", transition: "0.2s ease-in", marginTop: ".2rem" };

		return <Card style={style} className="shadow-lg">
			<Card.Header>
				<Nav variant="tabs" defaultActiveKey="/razgar#cross">
					<Nav.Item>
						<Nav.Link href="/razgar#cross" onClick={() => this.toggleState("cross")}>Поперечные</Nav.Link>
					</Nav.Item>
					<Nav.Item>
						<Nav.Link href="/razgar#lengthwise" onClick={() => this.toggleState("long")}>Продольные</Nav.Link>
					</Nav.Item>
				</Nav>
			</Card.Header>
			<Card.Body>
				{this.state.content}
			</Card.Body>
		</Card >
	}
} 