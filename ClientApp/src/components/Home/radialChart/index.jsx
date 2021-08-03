import React, { Component, Fragment } from 'react';
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4lang_ru_RU from "@amcharts/amcharts4/lang/ru_RU";
import moment from 'moment';
import { fillSectionIndicator } from "./fillSectionIndicator";



export class RadialChart extends Component {
	chart = null


	componentDidMount = () => {
		if (this.chart)
			this.chart.dispose();

		this.drawChart(this.props.chartData);
	}


	componentDidUpdate = oldProps => {
		if (oldProps.chartData !== this.props.chartData) {
			this.fillChartData(this.props.chartData);
			this.chart.validateData();
		}
	}

	componentWillUnmount = () => {
		if (this.chart)
			this.chart.dispose();
	}


	////////// RENDER
	render = () => {
		//console.log("chart: render");
		const poyas = this.props.chartData.poyas

		return <Fragment>
			<canvas width="120" height="120" id="radial-canvas" title="Выбранный пояс (красный - самый горячий)"></canvas>
			<div className="fitter">
				<div id="wrapper" className={`wrapper h${poyas}`}></div>
			</div>
			<div id="chartdiv"></div>
		</Fragment>
	}



	fillChartData = chartData => {
		this.chart.data.length = 0
		const poyas = chartData.poyas;

		fillSectionIndicator(poyas, chartData.hottestPoyas)

		// разбираем данные по лучам
		for (let luch = 1; luch < 33; ++luch) {
			const item = { "axis": `${luch} луч` }

			// разбираем данные по изотермам
			for (let prop in chartData[luch]) {
				if (prop === "meters") {
					chartData[luch]["meters"].forEach((meter, idx) => {
						item[`meterRadius${idx}`] = meter.meterRadius
						item[`meterTemp${idx}`] = meter.meterTemp
						item[`meterColor${idx}`] = meter.meterError ? "red" : "palegreen"
					})
				}
				else {
					const point = chartData[luch][prop]
					const T = prop.split("value")[1]

					item[`value${T}`] = point["radius"]
					item[`temp${T}`] = point["temp"]
				}
			}

			this.chart.data.push(item)
		}

		document.getElementsByClassName("title")[0]
			.innerText = `${moment(this.props.date).format("DD.MM.yyyy")} - ГОРИЗОНТАЛЬНОЕ СЕЧЕНИЕ ПО ${poyas} ПОЯСУ`;
	}


	drawChart = chartData => {
		const chart = am4core.create("chartdiv", am4charts.RadarChart);
		this.chart = chart

		this.fillChartData(chartData);


		/////////// AXIS
		let categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
		categoryAxis.dataFields.category = "axis";
		categoryAxis.tooltip.pointerOrientation = "down"
		categoryAxis.cursorTooltipEnabled = true
		//categoryAxis.renderer.grid.template.stroke = am4core.color("black");
		//categoryAxis.renderer.grid.template.strokeWidth = 1;
		categoryAxis.fontSize = 12;
		//categoryAxis.renderer.labels.template.horizontalCenter = "right";
		categoryAxis.renderer.labels.template.location = 0;
		//categoryAxis.renderer.labels.template.fillOpacity = 1;

		let valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
		//valueAxis.renderer.grid.template.stroke = am4core.color("black");
		//valueAxis.renderer.grid.template.strokeWidth = 1;
		//valueAxis.renderer.grid.template.strokeOpacity = 0.2;
		valueAxis.fontSize = 12;
		valueAxis.min = 0;
		valueAxis.max = 5668;
		//valueAxis.renderer.inversed = true;
		valueAxis.strictMinMax = true;


		/////////// RADAR SERIES
		const colors = {
			"300": "blue",
			"500": "teal",
			"800": "orange",
			"1150": "red"
		};

		// максимальное число изотем 4, поэтому создадим их для возможного последующего отображения
		Object.keys(colors).forEach(num => {
			let series = chart.series.push(new am4charts.RadarSeries());
			series.dataFields.valueY = `value${num}`;
			series.dataFields.temperature = `temp${num}`;
			series.adapter.add("tooltipText", (value, target, key) => {
				if (target.name === "1150°C: ")
					return "";
				return value;
			})
			series.tooltipText = "{temperature}°C: [bold]{valueY} мм[/]";
			series.tooltip.getFillFromObject = false;
			series.tooltip.pointerOrientation = "right"
			series.tooltip.background.fill = am4core.color(colors[num]);
			series.tooltip.background.opacity = 0.7;
			series.dataFields.categoryX = "axis";
			series.name = `${num}°C: `;
			series.strokeWidth = 4;
			series.tensionX = 0.8;
			series.tensionY = 0.8;
			series.stroke = am4core.color(colors[num]);

			// series.propertyFields.stroke = "color";
			// series.propertyFields.fill = "color";

			//let bullet = series.bullets.push(new am4charts.Bullet());
			//bullet.fill = series.stroke;
			//let circle = bullet.createChild(am4core.Circle);
			//circle.radius = 5;
		});


		/////////// METERS
		// максимальное количество датчиков на луче = 3шт
		const meters = Array.from(Array(3))

		meters.forEach((item, idx) => {
			const meterSeries = chart.series.push(new am4charts.RadarSeries());
			meterSeries.strokeOpacity = 0;
			meterSeries.dataFields.valueY = `meterRadius${idx}`;
			meterSeries.dataFields.categoryX = "axis";
			meterSeries.tooltipText = `Датчик: {meterTemp${idx}}°C`
			meterSeries.tooltip.fontSize = 11
			meterSeries.tooltip.background.opacity = 0.8
			meterSeries.tooltip.pointerOrientation = "left"
			meterSeries.propertyFields.fill = `meterColor${idx}`
			meterSeries.adapter.add("tooltipText", (value, target) => {
				if (target.tooltipDataItem.valueY > 0)
					return value
				return null
			})

			let circleBullet = meterSeries.bullets.push(new am4charts.CircleBullet());
			circleBullet.circle.radius = 3
			circleBullet.propertyFields.fill = `meterColor${idx}`
			circleBullet.stroke = am4core.color("grey")
		})



		////// COLUMN SERIES
		let series1 = chart.series.push(new am4charts.RadarColumnSeries());
		series1.columns.template.adapter.add("tooltipText", (value, target, key) => {
			const result = this.colorAdapter(null, target)

			return result.color === "gray"
				? `1150°C: {valueY.value} мм ГАРНИСАЖ ${result.value} мм`
				: result.color === "coral"
					? `1150°C: {valueY.value} мм РАЗГАР ${result.value} мм`
					: `1150°C: {valueY.value} мм НОРМА`
		})
		series1.columns.template.tooltipPosition = "pointer";
		series1.columns.template.width = am4core.percent(100);
		series1.dataFields.categoryX = "axis";
		series1.dataFields.valueY = "value1150";
		series1.strokeWidth = 0;
		series1.fillOpacity = 0.4;
		series1.columns.template.rotation = -5.625	// rotate down by half sector
		series1.columns.template.adapter.add("fill", (fill, target) => this.colorAdapter(fill, target).color);



		/////////////// CURSOR
		chart.cursor = new am4charts.RadarCursor();
		chart.cursor.lineY.stroke = am4core.color("black");
		chart.cursor.lineX.stroke = am4core.color("black");
		chart.cursor.lineX.strokeOpacity = 1;
		chart.cursor.lineY.strokeOpacity = 1;
		chart.cursor.xAxis = categoryAxis;


		chart.language.locale = am4lang_ru_RU;
		chart.padding(0, 0, 0, 0);
		chart.margin(0, 0, 0, 0);
	}


	colorAdapter = (fill, target) => {
		const poyas = this.props.chartData.poyas;
		const luch = target.dataItem.index + 1;
		const r1150 = target.dataItem.valueY;

		let r5_r29 = 3854;
		let r29_r5 = 4065;
		switch (poyas) {
			case 6:
				r29_r5 = 3520;
				r5_r29 = 3527;
				break;
			case 7:
				r29_r5 = 3750;
				r5_r29 = 3854;
				break;
			case 8: case 9: case 10: case 11:
				r29_r5 = 3865;
				r5_r29 = 4065;
				break;
			case 12:
				r5_r29 = 4065;
				break;
			default: break;
		}
		const rWall = luch > 5 && luch < 29 ? r5_r29 : r29_r5;

		const color = r1150 > rWall
			? "coral"
			: Math.abs(r1150 - rWall) > window.deltaGarnisazh
				? "gray"
				: "green";

		return { color, value: Math.abs(r1150 - rWall) }
	}

}