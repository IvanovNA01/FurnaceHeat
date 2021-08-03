import React, { Component } from 'react';
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_kelly from "@amcharts/amcharts4/themes/kelly";
import am4lang_ru_RU from "@amcharts/amcharts4/lang/ru_RU";
import moment from "moment"
import { hideLoading } from "../../Layout/extra";

am4core.useTheme(am4themes_kelly);

export class R1150Chart extends Component {

	series = new Map()

	componentDidMount = () => {
		if (this.chart)
			this.chart.dispose();

		this.drawChart(this.props.chartData);
	}


	componentDidUpdate = oldProps => {
		if (oldProps.chartData !== this.props.chartData) {
			if (!this.props.chartData.data || !oldProps.chartData.data) ///// to avoid error while fast datepicker scrolling
				return

			if (oldProps.chartData.poyas !== this.props.chartData.poyas
				|| oldProps.chartData.chartType !== this.props.chartData.chartType
				|| oldProps.chartData.data.length !== this.props.chartData.data.length
				|| oldProps.chartData.data[0].date !== this.props.chartData.data[0].date) {
				this.fillChartData(this.chart, this.props.chartData);
				this.chart.invalidateData();
			}

			const luchi = this.props.chartData.luchi
			const chartLuchi = Array.from(this.series.keys())

			///////////////////////////////// remove absent luchi from chart series
			chartLuchi.forEach(cl => {
				if (!luchi.some(luch => luch === cl)) {
					const index = this.chart.series.indexOf(this.series.get(cl))
					this.chart.series.removeIndex(index).dispose()
					this.series.delete(cl)
				}
			})

			///////////////////////////////// add new luchi to chart series
			luchi.forEach(luch => {
				if (!this.series.has(luch)) {
					const serie = this.createSeries(luch, this.props.chartData.chartType)
					this.chart.series.push(serie)
					this.series.set(luch, serie)
				}
			})

			////////////////////////////////////////////// check whether show approximation line or not
			const dateAxis = this.chart.xAxes.values[0]
			const forecastON = moment(this.props.chartData.data[this.props.chartData.data.length - 1].date) >= moment().startOf("day")

			if (dateAxis.axisRanges.values.length === 0 && forecastON) {
				const range = dateAxis.axisRanges.create()
				range.date = moment().subtract(1, "day").startOf("day").add(12, "hour").toDate()
				range.grid.strokeWidth = 1
				range.grid.strokeDasharray = "8,4"
				range.grid.stroke = am4core.color("darkorange")
				range.grid.strokeOpacity = 1

				range.label.text = "Зона прогноза"
				range.label.fill = am4core.color("darkorange")
				range.label.inside = true
				range.label.rotation = 90
				range.label.horizontalCenter = "right"
				range.label.verticalCenter = "bottom"
				range.label.location = 0
			} else if (dateAxis.axisRanges.values.length > 0 && !forecastON) {
				dateAxis.axisRanges.clear()
			}

			setTimeout(() => {
				hideLoading()
			}, 50)
		}
	}


	componentWillUnmount = () => {
		if (this.chart)
			this.chart.dispose();
	}



	////////// RENDER
	render = () => {
		// console.log("r1150-chart: render");/////////////////

		return <div id="r1150chartdiv"></div>
	}



	fillChartData = (chart, chartData) => {
		chart.data.length = 0
		chart.data = chartData.data
		const poyas = +chartData.poyas

		const title = document.querySelector(".title")

		title.innerText = chartData.chartType === "r1150"
			? poyas > 0 && poyas < 1668
				? `ОСТАТОЧНАЯ ТОЛЩИНА СТЕНКИ НА ${poyas} ПОЯСЕ, мм`
				: `ОСТАТОЧНАЯ ВЫСОТА ЛЕЩАДИ НА РАДИУСЕ ${poyas}, мм`
			: chartData.chartType === "temp"
				? `ТЕМПЕРАТУРЫ НА ${poyas} ПОЯСЕ ЗА ${chartData.data.length} ДНЕЙ, °C`
				: poyas > 0 && poyas < 1668
					? `ТЕПЛОВОЙ ПОТОК СТЕНКИ НА ${poyas} ПОЯСЕ, ккал/ч`
					: `ТЕПЛОВОЙ ПОТОК ЛЕЩАДИ НА РАДИУСЕ ${poyas}, ккал/ч`
	}



	createSeries = (num, chartType) => {
		const series = new am4charts.LineSeries();
		series.dataFields.valueY = `Луч ${num}`;
		series.name = `Луч ${num}`;
		series.dataFields.dateX = "date";
		const dimentions = chartType === "r1150"
			? "мм"
			: chartType === "temp"
				? "°C"
				: "ккал/ч"
		series.tooltipText = `Луч ${num}: [bold]{Луч ${num}} ${dimentions}[/], {date.formatDate('dd.MM.yyyy')}`;
		series.tooltip.fontSize = 13;
		series.strokeWidth = 3;
		//series.fillOpacity = 0.2;
		series.tensionX = 0.9;
		series.tensionY = 0.9;

		series.tooltip.background.opacity = 0.7;

		// Make bullets grow on hover
		let bullet = series.bullets.push(new am4charts.CircleBullet());
		bullet.circle.strokeWidth = 2;
		//bullet.circle.stroke = chart.colors[num];
		bullet.circle.fill = am4core.color("white");
		bullet.circle.radius = 2;

		let bullethover = bullet.states.create("hover");
		bullethover.properties.scale = 2;

		return series
	}


	drawChart = props => {
		let chart = am4core.create("r1150chartdiv", am4charts.XYChart);
		this.fillChartData(chart, props);

		// Set input format for the dates
		chart.dateFormatter.inputDateFormat = "yyyy-MM-dd";

		// Create axes
		const dateAxis = chart.xAxes.push(new am4charts.DateAxis());
		dateAxis.fontSize = 12;
		dateAxis.renderer.labels.template.fill = am4core.color("gray")
		dateAxis.renderer.grid.template.location = 0.5;
		dateAxis.renderer.labels.template.location = 0.5;
		dateAxis.renderer.minGridDistance = 60;
		//dateAxis.strictMinMax = true;
		//dateAxis.startLocation = 0.5;
		//dateAxis.endLocation = 0.5;

		const valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
		valueAxis.min = -10;
		//valueAxis.max = 4200;
		//valueAxis.strictMinMax = true;
		valueAxis.fontSize = 12;
		valueAxis.renderer.labels.template.fill = am4core.color("gray")

		////// appending series
		props.luchi.forEach(luch => {
			const serie = this.createSeries(luch, props.chartType)
			chart.series.push(serie)
			this.series.set(luch, serie)	//////// Map: luch->serie
		})

		/////// Make a panning cursor
		chart.cursor = new am4charts.XYCursor();
		chart.cursor.behavior = "panXY";
		chart.cursor.xAxis = dateAxis;
		//chart.cursor.snapToSeries = series;

		/////////////// LEGEND
		chart.legend = new am4charts.Legend();
		chart.legend.position = "right";
		chart.legend.valign = "top";
		chart.legend.fontSize = 14;
		// chart.legend.marginTop = 0;
		// chart.legend.maxWidth = 400;
		// chart.legend.background.fill = am4core.color("whitesmoke")
		// chart.legend.marginLeft = 30;

		chart.language.locale = am4lang_ru_RU;
		this.chart = chart;
		setTimeout(() => hideLoading(), 50)
	}
}