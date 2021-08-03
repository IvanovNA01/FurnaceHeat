
export const showLoading = () => {
	document.querySelector(".loading").style.opacity = "1"
	document.querySelector(".myfade").style.visibility = "visible"
}

export const hideLoading = () => {
	document.querySelector(".loading").style.opacity = "0"
	document.querySelector(".myfade").style.visibility = "hidden"
}