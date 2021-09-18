const submit = document.querySelector("input[type='submit']")
const err = document.querySelector(".error-div")

submit.addEventListener('click', () => {
	err.style.display = "none"
	setLoading(true)
})

const setLoading = (state) => {
	const loading = document.querySelector("#login-load")
	const panels = document.querySelectorAll("#login-form")

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