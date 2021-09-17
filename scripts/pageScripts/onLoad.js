let clientCookies = document.cookie
clientCookies = clientCookies.split(/[=, ;]+/)

window.addEventListener("load", () => {
	setPerfilInfoLoading(true)

	let xhr = new XMLHttpRequest();
	xhr.withCredentials = false;

	xhr.addEventListener("readystatechange", function () {
		if (this.readyState === 4) {
			try {
				const data = JSON.parse(this.responseText);
				
				const dataKeys = Object.keys(data[0])

				for (let key in dataKeys) {
					if (!dataKeys[key].startsWith("_") 
						&& dataKeys[key] != "senha"
						&& dataKeys[key] != "id"
						&& dataKeys[key] != "accessKey"
						&& dataKeys[key] != "likes"
						&& dataKeys[key] != "dislikes"
					) {
						
						console.log(data[0][dataKeys[key]])
						createFormField(dataKeys[key], data[0][dataKeys[key]])

					}
				}

				setPerfilInfoLoading(false)

				initiatePerfilEditToggle()

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


const initiatePerfilEditToggle = () => {
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

		// quando o usuário clicar em "Cancelar", 
		// a página ira dar refresh, 
		// para que as informações fiquem iguais ao servidor
		if (toggle) {
			saveInfo.remove()
			setTimeout(() => {
				window.location.reload()
			}, 100)
		} else {
			// exibindo botão de salvar
			saveInfo.style.display = 'flex'
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