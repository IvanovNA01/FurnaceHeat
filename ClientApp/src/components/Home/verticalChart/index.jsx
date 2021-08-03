import React, { Component, Fragment } from 'react';
import { Abs } from "../../../algorithm/smallFunctions";
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4lang_ru_RU from "@amcharts/amcharts4/lang/ru_RU";
import fillRayIndicator from './fillRayIndicator';
import moment from 'moment';




export class VerticalChart extends Component {
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


	getBgClass = luch => {
		switch (luch) {
			case 1: case 2: case 4: case 30: case 32: return "v1-2-4-30-32";
			case 3: case 31: return "v3-31";
			case 5: case 29: return "v5-29";
			default: return "v6-28";
		}
	}


	////////// RENDER
	render = () => {
		const luch = this.props.chartData.luch

		return <Fragment>
			<canvas width="150" height="150" id="my-canvas" title="Выбранный луч (красный - самый горячий)"></canvas>
			<div className="v-fitter">
				<div id="wrapper" className={`v-wrapper ${this.getBgClass(luch)}`}></div>
			</div>
			<div id="v-chartdiv"></div>
		</Fragment>
	}


	getRWall = (poyas, luch) => poyas === 6
		? luch < 29 && luch > 5 ? 3527 : 3520
		: poyas === 7
			? luch < 29 && luch > 5 ? 3854 : 3750
			: poyas === 12
				? 4065
				: poyas === undefined
					? 4050
					: luch < 29 && luch > 5 ? 4065 : 3865


	fillChartData = chartData => {
		this.chart.data.length = 0;

		const luch = chartData.luch;
		fillRayIndicator(luch, chartData.hottestLuch);

		const items1150 = chartData.data[1150].slice();
		const items800 = chartData.data[800].slice();
		const items500 = chartData.data[500].slice();
		const items300 = chartData.data[300].slice();

		const hLeshad = 4050;

		items1150.forEach(item => {
			const rWall = this.getRWall(item.poyas, luch)

			item.color1150 = ("poyas" in item)
				? item.left1150 > rWall
					? am4core.color("red")
					: item.left1150 < rWall - window.deltaGarnisazh
						? am4core.color("gray")
						: am4core.color("green")
				: item.top1150 > hLeshad ? am4core.color("green") : am4core.color("red")
		})

		items800.forEach(item => item.color800 = am4core.color("coral"))
		items500.forEach(item => item.color500 = am4core.color("teal"))
		items300.forEach(item => item.color300 = am4core.color("blue"))

		////// assembling chart data + meters
		this.chart.data = [...items1150, ...items800, ...items500, ...items300, ...chartData.data.meters]

		this.chart.prevTarget = null;	///// the extra field necessary to draw tooltips correctly

		document.getElementsByClassName("title")[0].innerText = `${moment(this.props.date).format("DD.MM.yyyy")} - ВЕРТИКАЛЬНОЕ СЕЧЕНИЕ ПО ${this.props.chartData.luch} ЛУЧУ`;
	}


	drawChart = props => {
		const chart = am4core.create("v-chartdiv", am4charts.XYChart);
		this.chart = chart

		this.fillChartData(props);

		/////////// AXIS
		let xAxis = chart.xAxes.push(new am4charts.ValueAxis());
		xAxis.min = 0;
		xAxis.max = 5660;
		xAxis.strictMinMax = true;
		xAxis.fontSize = 12;
		xAxis.renderer.grid.template.disabled = true;
		xAxis.renderer.baseGrid.disabled = true;

		let yAxis = chart.yAxes.push(new am4charts.ValueAxis());
		yAxis.min = 0;
		yAxis.max = 9500;
		yAxis.strictMinMax = true;
		yAxis.fontSize = 12;
		yAxis.renderer.baseGrid.disabled = true;
		yAxis.renderer.grid.template.disabled = true;


		//////////// SERIES
		const createSeries = temp => {
			const series = chart.series.push(new am4charts.LineSeries());
			series.dataFields.valueX = `left${temp}`
			series.dataFields.valueY = `top${temp}`
			series.strokeWidth = temp === 1150 ? 4 : 2
			series.tooltipText = "Hello"


			series.propertyFields.stroke = `color${temp}`

			series.tensionX = temp === 1150 ? 0.95 : 0.9;
			series.tensionY = temp === 800 ? 0.8 : 0.9;

			if (temp === 1150) {
				const bullet = series.bullets.push(new am4charts.CircleBullet());
				bullet.tooltipPosition = "pointer"
				bullet.circle.radius = 3
				bullet.circle.strokeWidth = 15
				bullet.circle.strokeOpacity = 0
				series.tooltip.background.fillOpacity = 0.7

				bullet.adapter.add("fill", (val, target) => {
					return this.fillHandler(target.dataItem.index === 10 && chart.prevTarget ? chart.prevTarget : target).color
				});

				bullet.adapter.add("visible", (val, target) => {
					const index = target.dataItem.index;
					if (index === 10)
						return false
					return true
				})

				bullet.tooltipText = "dd"
				bullet.adapter.add("tooltipText", (val, target) => {
					const index = target.dataItem.index;
					if (index === 9)
						chart.prevTarget = target;

					const poyas = index + 4;

					const fhResult = this.fillHandler(index === 10 && chart.prevTarget ? chart.prevTarget : target)
					const color = fhResult.color
					const delta = fhResult.delta

					let tooltipText = "";
					if (poyas < 7) {
						const r = poyas === 4
							? 0
							: poyas === 5
								? 1668
								: 3518
						tooltipText += `РАДИУС ${r}\n1150°C: h={valueY} мм\n`;
					}
					else if (poyas < 14)
						tooltipText += `ПОЯС ${poyas - 1}\n1150°C: R={valueX} мм\n`;

					if (poyas < 14)
						tooltipText += `${color === "red"
							? `РАЗГАР ${delta} мм`
							: color === "gray" ? `ГАРНИСАЖ ${delta} мм` : "НОРМА"}`;

					return tooltipText;
				})

				//chart.cursor = new am4charts.XYCursor();
				//chart.cursor.behavior = "panXY";
				//chart.cursor.xAxis = xAxis;
				//chart.cursor.snapToSeries = series;
			}
		}

		createSeries(1150)
		createSeries(800)
		createSeries(500)
		createSeries(300)


		//////////// meters
		const meterSeries = chart.series.push(new am4charts.LineSeries())
		meterSeries.dataFields.valueX = "left"
		meterSeries.dataFields.valueY = "top"
		meterSeries.strokeOpacity = 0
		meterSeries.tooltip.fontSize = 11
		meterSeries.tooltip.background.opacity = 0.9

		const circleBullet = meterSeries.bullets.push(new am4charts.CircleBullet());
		circleBullet.circle.radius = 3
		circleBullet.circle.stroke = am4core.color("black")
		circleBullet.propertyFields.fill = "color"
		circleBullet.tooltipPosition = "pointer"
		circleBullet.tooltipText = "dd"
		circleBullet.adapter.add("tooltipText", (val, target) => {
			const value = target.dataItem.dataContext.value
			const error = target.dataItem.dataContext.error
			return error ? `Датчик: подмена ${value}°C` : `Датчик: ${value}°C`
		})


		/////// calibration
		//this.gaugeChart(chart); 

		chart.language.locale = am4lang_ru_RU;
	}


	// The function to gauge chart width drawing precision
	gaugeChart = chart => {
		let controlSeries1 = chart.series.push(new am4charts.LineSeries());
		controlSeries1.dataFields.valueX = "x1";
		controlSeries1.dataFields.valueY = "y1";
		controlSeries1.stroke = am4core.color("blue");
		controlSeries1.strokeWidth = 1;

		let controlSeries2 = chart.series.push(new am4charts.LineSeries());
		controlSeries2.dataFields.valueX = "x2";
		controlSeries2.dataFields.valueY = "y2";
		controlSeries2.stroke = am4core.color("blue");
		controlSeries2.strokeWidth = 1;

		let controlSeries3 = chart.series.push(new am4charts.LineSeries());
		controlSeries3.dataFields.valueX = "x3";
		controlSeries3.dataFields.valueY = "y3";
		controlSeries3.stroke = am4core.color("blue");
		controlSeries3.strokeWidth = 1;

		let controlSeries4 = chart.series.push(new am4charts.LineSeries());
		controlSeries4.dataFields.valueX = "x4";
		controlSeries4.dataFields.valueY = "y4";
		controlSeries4.stroke = am4core.color("blue");
		controlSeries4.strokeWidth = 1;

		let controlSeries5 = chart.series.push(new am4charts.LineSeries());
		controlSeries5.dataFields.valueX = "x5";
		controlSeries5.dataFields.valueY = "y5";
		controlSeries5.stroke = am4core.color("blue");
		controlSeries5.strokeWidth = 1;

		let controlSeries6 = chart.series.push(new am4charts.LineSeries());
		controlSeries6.dataFields.valueX = "x6";
		controlSeries6.dataFields.valueY = "y6";
		controlSeries6.stroke = am4core.color("blue");
		controlSeries6.strokeWidth = 1;

		chart.data.push(
			{ x2: 1668, y2: 0 },
			{ x2: 1668, y2: 9000 },

			{ x1: 3520, y1: 0 },
			{ x1: 3520, y1: 9000 },

			{ x3: 3865, y3: 0 },
			{ x3: 3865, y3: 9000 },

			{ x4: 4065, y4: 0 },
			{ x4: 4065, y4: 9000 },

			{ x5: 0, y5: 5150 },
			{ x5: 5000, y5: 5150 },

			{ x6: 0, y6: 7200 },
			{ x6: 5000, y6: 7200 },
		);
	}

	fillHandler = (target) => {
		const index = target.dataItem.index;
		const left = target.dataItem.valueX;
		const top = target.dataItem.valueY;

		const luch = this.props.chartData.luch;
		const hLeshad = 4050;

		const poyas = index + 4;
		const rWall = poyas === 7
			? luch < 29 && luch > 5 ? 3527 : 3520
			: poyas === 8
				? luch < 29 && luch > 5 ? 3854 : 3750
				: poyas === 13
					? 4065
					: poyas < 7
						? 4050
						: luch < 29 && luch > 5 ? 4065 : 3865

		let color
		let delta

		switch (poyas) {
			case 4: case 5: case 6:
				color = top < hLeshad ? "red" : "green"
				delta = Abs(hLeshad - top)
				break
			default:
				color = left > rWall
					? "red"
					: (rWall - left) > window.deltaGarnisazh ? "gray" : "green"
				delta = Abs(rWall - left)
		}

		return { color, delta }
	}

}