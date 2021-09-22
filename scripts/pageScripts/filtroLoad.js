const novaBusca = document.querySelector('#novaBusca')
const userHelp = document.querySelector("#user-help-filtro")

let firstTime = true

novaBusca.addEventListener("click", () => {
	
	if (firstTime) {
		userHelp.style.display = 'none'
		setFiltrosLoading(true)

		let xhr = new XMLHttpRequest();
		xhr.withCredentials = false;

		xhr.addEventListener("readystatechange", function () {
			if (this.readyState === 4) {
				let data = JSON.parse(this.responseText);

				gerarOptions(data)
			}
		});

		xhr.open("GET", "https://pisample-250e.restdb.io/rest/areasinteresse");
		xhr.setRequestHeader("content-type", "application/json");
		xhr.setRequestHeader("x-apikey", "6112d0b769fac573b50a540e");
		xhr.setRequestHeader("cache-control", "no-cache");

		xhr.send(null);
	}

})

const gerarOptions = (data) => {

	data = data[0]
	const interesse1 = document.querySelector("#areaInteresse1")
	const interesse2 = document.querySelector("#areaInteresse2")


	for (let item in data.interessePrincipal) {
		const option = document.createElement("option")
		option.setAttribute("value", data.interessePrincipal[item])
		option.innerHTML = data.interessePrincipal[item]
		interesse1.appendChild(option)
	}
	for (let item in data.interesseSecundario) {
		const option = document.createElement("option")
		option.setAttribute("value", data.interesseSecundario[item])
		option.innerHTML = data.interesseSecundario[item]
		interesse2.appendChild(option)
	}

	setFiltrosLoading(false)
	firstTime = false

}

const setFiltrosLoading = (state) => {
	const loading = document.querySelector("#loading-filtros")
	const panels = document.querySelectorAll("#filtro-form")

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