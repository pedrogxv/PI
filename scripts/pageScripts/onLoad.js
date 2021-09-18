let clientCookies = document.cookie
clientCookies = clientCookies.split(/[=, ;]+/)

window.addEventListener("load", () => {
	setPerfilInfoLoading(true)

	let xhr = new XMLHttpRequest();
	xhr.withCredentials = false;

	xhr.addEventListener("readystatechange", function () {
		if (this.readyState === 4) {
			try {
				console.log(clientCookies)
				const data = JSON.parse(this.responseText);
				
				const dataKeys = Object.keys(data[0])

				for (let key in dataKeys) {
					if (!dataKeys[key].startsWith("_") 
						&& dataKeys[key] != "senha"
						&& dataKeys[key] != "id"
						&& dataKeys[key] != "accessKey"
						&& dataKeys[key] != "favoritos"
						&& dataKeys[key] != "dislikes"
					) {
						
						createFormField(dataKeys[key], data[0][dataKeys[key]])

					}
				}

				setPerfilInfoLoading(false)

				initiatePerfilEditToggle(data[0])

			} catch (e) {
				setPerfilInfoLoading(false)
				console.log(e)
			}
		}
	});

	xhr.open("GET", `https://pisample-250e.restdb.io/rest/userdata?q={"email": "${clientCookies[3]}", "senha": "${clientCookies[5]}"}`);
	xhr.setRequestHeader("content-type", "application/json");
	xhr.setRequestHeader("x-apikey", "6112d0b769fac573b50a540e");
	xhr.setRequestHeader("cache-control", "no-cache");

	xhr.send(null);
})


const createFormField = (dataName, dataValue) => {
	const formField = document.createElement("div")
	formField.className = "form-field"

	const fieldLabel = document.createElement("label")
	fieldLabel.className = "field-label"
	fieldLabel.setAttribute("for", `${dataName}`)
	fieldLabel.innerHTML = `${dataName}`

	const fieldInput = document.createElement("input")
	fieldInput.className = "field-input field-toggle"
	fieldInput.disabled = true
	fieldInput.setAttribute("type", "text")
	fieldInput.setAttribute("name", `${dataName}`)
	fieldInput.setAttribute("value", `${dataValue}`)

	formField.appendChild(fieldLabel)
	formField.appendChild(fieldInput)

	const perfilForm = document.querySelector("#perfil-form")
	perfilForm.appendChild(formField)
}


const initiatePerfilEditToggle = (oldData) => {
	// script para fazer a alternância dos botões
	// de 'Editar informções' e 'Cancelar'

	const fieldToggles = document.querySelectorAll(".field-toggle")
	const toggleHandler = document.querySelector('#toggle-handler')
	const saveInfo = document.querySelector("#save-info")

	let toggle = fieldToggles[0].disabled

	toggleHandler.addEventListener('click', () => {
		toggle = !toggle
		fieldToggles.forEach((current) => {
			current.disabled = toggle
		})

		// toggle entre 'Cancelare' e 'Editar Info'
		toggleHandler.innerHTML = !toggle ? "Cancelar" : "Editar Informações"

		// toggle entre btn e link
		toggleHandler.className = !toggle ? "no-link btn btn-red" : "no-link btn btn-borderless btn-border-green"

		if (toggle) {
			saveInfo.style.display = 'none'
		} else {
			// exibindo botão de salvar
			saveInfo.style.display = 'block'
			saveInfo.addEventListener("click", () => {

				toggleHandler.click()
				setPerfilInfoLoading(true)
				saveInfo.style.display = 'none'
				
				let newData = {}

				fieldToggles.forEach((field) => {
					// se a data antiga tiver o campo name do field
					// isso é feito para prevenir novas datas no bd
					if (typeof oldData[field.getAttribute("name")] != "undefined") {
						console.log(oldData[field.getAttribute("name")])
						// se for um campo de email
						if (field.getAttribute("name") === "email") {
							// se o valor não for nulo ou vazio
							if (field.value)
								newData[field.getAttribute("name")] = field.value
							else {
								alert("Seu email não pode ser nulo / vazio.")
							}
						} else {
							newData[field.getAttribute("name")] = field.value
						}
					}
				})

				console.log(newData)

				let data = JSON.stringify(newData);

				let xhr = new XMLHttpRequest();
				xhr.withCredentials = false;

				xhr.addEventListener("readystatechange", function () {
					if (this.readyState === 4) {
						window.location.reload()
					}
				});

				xhr.open("PUT", `https://pisample-250e.restdb.io/rest/userdata/${clientCookies[1]}`);
				xhr.setRequestHeader("content-type", "application/json");
				xhr.setRequestHeader("x-apikey", "6112d0b769fac573b50a540e");
				xhr.setRequestHeader("cache-control", "no-cache");

				xhr.send(data);

			})
		}

	})

}

const setPerfilInfoLoading = (state) => {
	const loading = document.querySelector("#perfilInfo-loading")
	const panels = document.querySelectorAll("#perfil-form")

	if (state) {
		loading.style.display = "block"
		panels.forEach((panel) => {
			panel.style.display = "none"
		})
	} else {
		loading.style.display = "none"
		panels.forEach((panel) => {
			panel.style.display = "block"
		})
	}
}