const fillRayIndicator = (luch, hottestLuch) => {
	let canvas = document.getElementById('my-canvas');
	let context = canvas.getContext('2d');
	let centerX = canvas.width / 2;
	let centerY = canvas.height / 2;
	let radius = 60;
	context.font = '10pt Calibri';
	context.fillStyle = 'coral';

	const toRadians = deg => ((deg - 90) * Math.PI) / 180;

	context.clearRect(0, 0, canvas.width, canvas.height);

	// внешняя серая окружность
	context.beginPath();
	for (let i = 0; i < 32; ++i) {
		context.arc(
			centerX,
			centerY,
			radius,
			toRadians(i * 11.25),						// начальный угол поворота
			toRadians(i * 11.25 + 11.25),		// конечный угол поворота
			false);
		context.lineTo(centerX, centerY);	// линия к центру
	}
	context.lineWidth = 1;
	context.strokeStyle = 'lightgray';
	context.setLineDash([])
	context.stroke();
	context.closePath();

	context.moveTo(centerX, centerY);

	// внутренняя серая окружность меньшего радиуса
	context.arc(centerX, centerY, radius - 4, 0, 2 * Math.PI, false);
	context.stroke();

	context.beginPath();
	context.moveTo(centerX, centerY);
	const angle = toRadians((luch - 1 + 0.5) * 11.25);
	const x = (radius + 10) * Math.cos(angle);
	const y = (radius + 10) * Math.sin(angle);

	// цифра пояса
	context.fillText(luch, centerX + x - 5, centerY + y + 5);

	// оранжевый сектор
	context.arc(
		centerX,
		centerY,
		radius,
		toRadians((luch - 1) * 11.25),
		toRadians((luch - 1) * 11.25 + 11.25),
		false);
	context.fill();
	context.lineWidth = 1;
	context.stroke();
	context.closePath();

	// hottest сектор
	context.beginPath()
	context.moveTo(centerX, centerY);
	context.arc(
		centerX,
		centerY,
		radius,
		toRadians((hottestLuch - 1) * 11.25),
		toRadians((hottestLuch - 1) * 11.25 + 11.25),
		false);
	context.fillStyle = "red"
	context.fill();
	context.lineWidth = 1;
	context.stroke();

	const hottestAngle = toRadians((hottestLuch - 1 + 0.5) * 11.25);
	const xx = (radius + 10) * Math.cos(hottestAngle);
	const yy = (radius + 10) * Math.sin(hottestAngle);
	context.fillText(hottestLuch, centerX + xx - 5, centerY + yy + 5);

	context.closePath();


	// оси леток
	context.beginPath()
	context.lineWidth = 1;
	context.strokeStyle = 'black';
	context.setLineDash([5, 5])

	const luch31angle = toRadians((31 - 1) * 11.25)
	const luch1angle = toRadians((3 - 1) * 11.25)

	const x31 = (radius + 10) * Math.cos(luch31angle)
	const y31 = (radius + 10) * Math.sin(luch31angle)

	context.moveTo(centerX, centerY)
	context.lineTo(centerX + x31, centerY + y31)
	context.fillStyle = 'black';
	context.fillText('Л1', centerX + x31 - 15, centerY + y31)

	const x1 = (radius + 10) * Math.cos(luch1angle)
	const y1 = (radius + 10) * Math.sin(luch1angle)

	context.moveTo(centerX, centerY)
	context.lineTo(centerX + x1, centerY + y1)
	context.fillText('Л2', centerX + x1, centerY + y1)

	context.stroke()
	context.closePath()
}

export default fillRayIndicator;