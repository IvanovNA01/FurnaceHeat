import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
//import * as serviceWorker from './serviceWorkerRegistration';

const baseUrl = document.getElementsByTagName('base')[0].getAttribute('href');
const rootElement = document.getElementById('root');

try {
	ReactDOM.render(
		<BrowserRouter basename={baseUrl}>
			<App />
		</BrowserRouter>,
		rootElement);
}
catch (error) { console.error(error) }


//serviceWorker.unregister();
