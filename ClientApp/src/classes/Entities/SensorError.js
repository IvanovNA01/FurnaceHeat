
export class SensorError {
	date
	poyas
	luch
	radius
	value

	constructor(poyas, luch, radius, value) {
		if (arguments.length > 1) {
			this.date = new Date().toISOString(true)
			this.poyas = +poyas
			this.luch = +luch
			this.radius = +radius
			this.value = +value
		}
		else {
			const other = arguments[0]

			this.date = other.date
			this.poyas = other.poyas
			this.luch = other.luch
			this.radius = other.radius
			this.value = other.value
		}
	}

	static equals(left, right) {
		return left.poyas === right.poyas
			&& left.luch === right.luch
			&& left.radius === right.radius
	}
}