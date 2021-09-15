
const submit = document.querySelector('#submit-senha')

submit.addEventListener("click", () => {
	setLoading(true)
})

const setLoading = (state) => {
	const loading = document.querySelector("#loading-senha")
	const senhas = document.querySelectorAll("#senha-div")
	const error = document.querySelector(".error-div")

	if (state) {
		loading.style.display = "block"
		console.log(loading.style.display)
		senhas.forEach((panel) => {
			panel.style.display = "none"
		})
		error.style.display = "none"
	} else {
		loading.style.display = "none"
		senhas.forEach((panel) => {
			panel.style.display = "flex"
		})
		error.style.display = "flex"
	}
}