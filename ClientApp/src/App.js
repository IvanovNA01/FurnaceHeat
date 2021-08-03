/* eslint-disable no-restricted-globals */
import React, { Component } from 'react';
import { Redirect, Route, Switch } from 'react-router';
import { Layout } from './components/Layout';
import { Home } from './components/Home';
import { Trends } from './components/Trends';
import { Usage } from './components/Usage'
import { CookieHandler } from "./classes/Handlers/CookieHandler";
import { DbHandler } from "./classes/Handlers/DbHandler";
import { ReleaseModal } from "./components/Layout/Modal";



import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import './custom.css';


const notFound = <div className="display-5 text-muted">404 - Запрашиваемая страница не найдена на сервере</div>;


export default class App extends Component {

	state = {
		modalVisible: false,
		appVersion: "22.06.2021.16.50",
	}


	toggleModal = _ => this.setState({ modalVisible: !this.state.modalVisible })


	checkAccess = props => {
		if (window.usageProtection) {
			if (!CookieHandler.getCookie("usage-token")) {
				if (prompt("Для входа введите пароль") !== window.usagePassword) {
					props.history.goBack()
					return
				}
			}
			CookieHandler.setCookie("usage-token", "true")
		}

		return <Usage />
	}


	//////// reloading application from the site when new version is available
	checkVersion = props => {
		DbHandler.getAppVersion()
			.then(siteVersion => {
				if (this.state.appVersion !== siteVersion) {
					CookieHandler.setCookie("updated", true)
					location.reload(true)
				}
				else if (CookieHandler.getCookie("updated")) {
					CookieHandler.deleteCookie("updated")
					this.setState({ modalVisible: true })
				}
			})
			.catch(error => console.error(error))

		switch (props.location.pathname) {
			case "/razgar": return <Home />
			case "/trends": return <Trends />
			case "/usage": return this.checkAccess(props)
			default: break
		}
	}


	render() {

		return (
			<Layout appVersion={this.state.appVersion}>
				<ReleaseModal siteVersion={this.state.appVersion} visible={this.state.modalVisible} toggleModal={this.toggleModal} />
				<Switch>
					<Route exact path="/razgar" render={props => this.checkVersion(props)} />
					<Route exact path="/trends" render={props => this.checkVersion(props)} />
					<Route exact path="/usage" render={props => this.checkVersion(props)} />
					<Redirect exact from="/" to="/razgar" />
					<Route path="/*" render={() => notFound} />
				</Switch>
			</Layout>
		);
	}
}
