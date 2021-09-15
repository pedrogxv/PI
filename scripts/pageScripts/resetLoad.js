
const submit = document.querySelector('#reset-form > input[type="submit"]')

submit.addEventListener("click", () => {
	setLoading(true)
})

const setLoading = (state) => {
	const loading = document.querySelector("#reset-load")
	const panels = document.querySelectorAll("#reset-form")

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