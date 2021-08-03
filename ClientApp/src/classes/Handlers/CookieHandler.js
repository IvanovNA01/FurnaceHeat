export class CookieHandler {

	/**
	 * retrieves a cookie by its name
	 * @param {string} name the name of the cookie
	 * @returns cookie value or undefined
	 */
	static getCookie(name) {
		let matches = document.cookie.match(new RegExp(
			"(?:^|; )" + name.replace(/([.$?*|{}()[]\\\/+^])/g, '\\$1') + "=([^;]*)"
		));
		return matches ? decodeURIComponent(matches[1]) : undefined;
	}


	/**
	 * sets new cookie to the browser
	 * @param {string} name the name of the cookie
	 * @param {string} value the value
	 * @param {object} options cookie options
	 */
	static setCookie(name, value, options = {}) {

		options = {
			path: '/',
			samesite: 'strict',
			"max-age": window.cookieOffset,
			...options
		};

		if (options.expires instanceof Date) {
			options.expires = options.expires.toUTCString();
		}

		let updatedCookie = encodeURIComponent(name) + "=" + encodeURIComponent(value);

		for (let optionKey in options) {
			updatedCookie += "; " + optionKey;

			let optionValue = options[optionKey];
			if (optionValue !== true)
				updatedCookie += "=" + optionValue;
		}

		document.cookie = updatedCookie;
	}



	/**
	 * unsets the cookie
	 * @param {string} name the name of the cookie
	 */
	static deleteCookie(name) {
		this.setCookie(name, "", { 'max-age': -1 })
	}
}