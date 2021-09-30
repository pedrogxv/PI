let clientCookies = document.cookie.split('; ').reduce((prev, current) => {
    const [name, ...value] = current.split('=');
    prev[name] = value.join('=');
    return prev;
}, {});

window.addEventListener("load", () => {	
	setPerfilInfoLoading(true)

	let xhr = new XMLHttpRequest();
	xhr.withCredentials = false;
	console.log(clientCookies.userMode == "candidato" ? `https://pisample-250e.restdb.io/rest/userdata?q={"email": "${clientCookies.email}", "senha": "${clientCookies.senha}"}`
	: `https://pisample-250e.restdb.io/rest/empresadata?q={"email": "${clientCookies.email}", "senha": "${clientCookies.senha}"}`)

	xhr.addEventListener("readystatechange", function () {
		if (this.readyState === 4) {
			try {
				const data = JSON.parse(this.responseText);
				console.log(data)
				console.log(this.responseText)
				
				const dataKeys = Object.keys(data[0])

				for (let key in dataKeys) {
					if (!dataKeys[key].startsWith("_") 
						&& dataKeys[key] != "senha"
						&& dataKeys[key] != "id"
						&& dataKeys[key] != "userMode"
						&& dataKeys[key] != "accessKey"
						&& dataKeys[key] != "favoritos"
						&& dataKeys[key] != "lastVisited"
						&& dataKeys[key] != "next"
						&& dataKeys[key] != "currentTarget"
						&& dataKeys[key] != "empresasViews"
						&& dataKeys[key] != "empresasViews"
						&& dataKeys[key] != "pilhaCandidatos"
						&& dataKeys[key] != "contatoCount"
						&& dataKeys[key] != "preferencias"

						&& dataKeys[key] != "links"
						&& dataKeys[key] != "cursos"
						&& dataKeys[key] != "experiencia"
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

	xhr.open("GET", clientCookies.userMode == "candidato" ? `https://pisample-250e.restdb.io/rest/userdata?q={"email": "${clientCookies.email}", "senha": "${clientCookies.senha}"}`
	: `https://pisample-250e.restdb.io/rest/empresadata?q={"email": "${clientCookies.email}", "senha": "${clientCookies.senha}"}`);
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
	// fazendo com q o primeiro caracter seja maiúsculo
	fieldLabel.innerHTML = `${dataName.at(0).toUpperCase() + dataName.slice(1)}`

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
			saveInfo.style.display = 'flex'
			saveInfo.addEventListener("click", () => {
				try {
					toggleHandler.click()
					setPerfilInfoLoading(true)
					saveInfo.style.display = 'none'
					
					let newData = {}

					fieldToggles.forEach((field) => {

						// se a data antiga tiver o campo name do field
						// isso é feito para prevenir novas datas no bd
						const nome_do_campo = field.getAttribute("name")
						if (oldData[nome_do_campo]) {
							
							if (!field.value)
								throw (`Campo < ${nome_do_campo} > não pode ser nulo`)
							
							if (field.value)
								newData[nome_do_campo] = field.value

						}
					})

					let data = JSON.stringify(newData);

					console.log(data)

					let xhr = new XMLHttpRequest();
					xhr.withCredentials = false;

					xhr.addEventListener("readystatechange", function () {
						if (this.readyState === 4) {
							window.location.reload()
						}
					});

					xhr.open("PUT", clientCookies.userMode == "candidato" ? `https://pisample-250e.restdb.io/rest/userdata/${clientCookies[1]}`
					: `https://pisample-250e.restdb.io/rest/empresadata/${clientCookies[1]}`);
					xhr.setRequestHeader("content-type", "application/json");
					xhr.setRequestHeader("x-apikey", "6112d0b769fac573b50a540e");
					xhr.setRequestHeader("cache-control", "no-cache");

					xhr.send(data);
				} catch (e) {
					console.log(e)
					alert(e)
				}

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