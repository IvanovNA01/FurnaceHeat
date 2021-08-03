
/** @type {HTMLCanvasElement} */
export const fillSectionIndicator = (poyas, hottestPoyas) => {
	const canvas = document.getElementById('radial-canvas');

	const printer = new FramePrinter(canvas, poyas, hottestPoyas);
	Array.from({ length: 12 }, (_, i) => i + 1).forEach(poyas => printer.drawPoyas(poyas))
}


class FramePrinter {
	context
	height = 8	// poyas height
	currentPoyas
	hottestPoyas

	constructor(canvas, currentPoyas, hottestPoyas) {
		this.hottestPoyas = hottestPoyas
		this.currentPoyas = currentPoyas
		this.context = canvas.getContext('2d');
		this.context.font = '8pt Calibri';
		this.context.fillStyle = 'coral';
		this.context.strokeStyle = 'darkgrey';
		this.context.lineWidth = 1;
		this.context.clearRect(0, 0, canvas.width, canvas.height);
	}

	drawPoyas(num) {
		let point = new Point(55, 105)
		let width = 85

		switch (num) {
			case 1: break;
			case 2: point.y -= this.height * 1; break;
			case 3: point.y -= this.height * 2; break;
			case 4: point.y -= this.height * 3; break;
			case 5: point.y -= this.height * 4; break;
			case 6: point.y -= this.height * 5; break;
			case 7: point.y -= this.height * 6; break;
			case 8: point.y -= this.height * 7; width = width - 4 * 1; break;
			case 9: point.y -= this.height * 8; width = width - 4 * 2; break;
			case 10: point.y -= this.height * 9; width = width - 4 * 3; break;
			case 11: point.y -= this.height * 10; width = width - 4 * 4; break;
			case 12: point.y -= this.height * 11; width = width - 4 * 5; break;
			default: break
		}

		const xDelta = num > 6 ? 2 : 0

		this.context.beginPath()
		this.context.moveTo(point.x, point.y)
		this.context.lineTo(point.x - width / 2, point.y)
		this.context.lineTo(point.x - width / 2 + xDelta, point.y - this.height)
		this.context.lineTo(point.x, point.y - this.height)
		this.context.moveTo(point.x, point.y)
		this.context.lineTo(point.x + width / 2, point.y)
		this.context.lineTo(point.x + width / 2 - xDelta, point.y - this.height)
		this.context.lineTo(point.x, point.y - this.height)
		if (num === this.currentPoyas) {
			this.context.fill()
			this.context.fillText(num, point.x + width / 2 + 5, point.y - 2)
		}
		if (num === this.hottestPoyas) {
			this.context.fillStyle = "red"
			this.context.fill()
			this.context.fillText(num, point.x + width / 2 + 5, point.y - 2)
			this.context.fillStyle = "coral"
		}
		this.context.stroke()
		this.context.closePath()

		if (num === 12) {
			this.context.beginPath()
			const initialPoint = new Point(point.x - width / 2 + 10, point.y - this.height)
			this.context.moveTo(initialPoint.x, initialPoint.y)
			this.context.lineTo(initialPoint.x, initialPoint.y + 7 * this.height - 1)
			this.context.lineTo(initialPoint.x + width - 20, initialPoint.y + 7 * this.height - 1)
			this.context.lineTo(initialPoint.x + width - 20, initialPoint.y)
			this.context.lineTo(initialPoint.x, initialPoint.y)
			this.context.fillStyle = "white"
			this.context.stroke()
			this.context.fill()
			this.context.closePath()
			this.context.beginPath()
			this.context.strokeStyle = "white"
			this.context.lineWidth = 2
			this.context.moveTo(initialPoint.x, initialPoint.y)
			this.context.lineTo(initialPoint.x + width - 20, initialPoint.y)
			this.context.stroke()
		}
	}
}


class Point {
	x
	y

	constructor(x, y) {
		this.x = x
		this.y = y
	}
}