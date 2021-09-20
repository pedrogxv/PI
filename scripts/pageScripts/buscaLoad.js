const submit = document.querySelector('#buscaInit')

submit.addEventListener("click", () => {
	setBodyLoading(true)
})

const setBodyLoading = (state) => {
	const loading = document.querySelector("#loading")
	const panels = document.querySelectorAll("section, aside")

	if (state) {
		loading.style.display = "block"
		console.log(loading.style.display)
		panels.forEach((panel) => {
			panel.style.display = "none"
		})
	} else {
		loading.style.display = "none"
		panels.forEach((panel) => {
			panel.style.display = "flex"
		})
	}
}