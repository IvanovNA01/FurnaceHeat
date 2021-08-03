import React from 'react';


export const Footer = (props) =>
	<div className="app-footer">
		<span>Версия: {props.appVersion}</span>
		<a href="mailto:NikitaIvanov@mechel.ru">Алгоритм расчета: Никита Иванов</a>
		<a href="mailto:GrigoriyDolgiy@mechel.ru">Разработчик: Григорий Долгий</a>
		<span>УИТ АСУТП 2020</span>
	</div>