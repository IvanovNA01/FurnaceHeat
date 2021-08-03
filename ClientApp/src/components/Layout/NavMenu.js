import React, { Component } from 'react';
import { Collapse, Container, Navbar, NavbarBrand, NavbarToggler, NavItem, NavLink } from 'reactstrap';
import { NavLink as Link } from 'react-router-dom';
import './styles.css';

export class NavMenu extends Component {
	static displayName = NavMenu.name;

	toggleNavbar = this.toggleNavbar.bind(this);

	state = {
		collapsed: true
	};

	toggleNavbar() {
		this.setState({
			collapsed: !this.state.collapsed
		});
	}

	render() {

		return (
			<header>
				<Navbar className="navbar-expand-sm navbar-toggleable-sm box-shadow mb-3 border-bottom" light>
					<Container fluid>
						<NavbarBrand tag={Link} to="/">
							<img src="logo.png" style={{ width: "100px" }} className="p-0 mb-1" alt="Мечел" />
						</NavbarBrand>
						<NavbarToggler onClick={this.toggleNavbar} className="mr-2" />
						<Collapse className="d-sm-inline-flex flex-sm" isOpen={!this.state.collapsed} navbar>
							<ul className="navbar-nav d-flex w-100">
								<div className="loading">
									<img src="loading.gif" alt="loading..." />Загрузка...</div>
								<div className="title flex-grow-1"></div>
								<NavItem>
									<NavLink tag={Link} to="/usage">СТАТИСТИКА</NavLink>
								</NavItem>
								<NavItem>
									<NavLink tag={Link} to="/trends">ТРЕНДЫ</NavLink>
								</NavItem>
								<NavItem>
									<NavLink tag={Link} to="/razgar">РАЗГАР ГОРНА</NavLink>
								</NavItem>
							</ul>
						</Collapse>
					</Container>
				</Navbar>
			</header>
		);
	}
}
