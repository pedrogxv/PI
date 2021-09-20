const actionMode = {
	UP: 'up',
	DOWN: 'down',
	STAR: 'star'
}

const upIcon = document.querySelector("#target-action-up")
const star = document.querySelector("#target-star")
const downIcon = document.querySelector("#target-action-down")

upIcon.addEventListener('click', () => {
	makeActionRequest(actionMode.UP, star.value)
})

star.addEventListener('click', () => {
	makeActionRequest(actionMode.STAR, star.value)
})

downIcon.addEventListener('click', () => {
	makeActionRequest(actionMode.DOWN, downIcon.value)
})

let browserCookies = document.cookie
browserCookies = browserCookies.split(/[=, ;]+/)

const makeActionRequest = (actionModeVal, _id) => {
	setActionLoading(true)

	const xhr = reqHead(
		"GET", 
		`https://pisample-250e.restdb.io/rest/userdata?q={"email": "${browserCookies[3]}", "senha": "${browserCookies[5]}"}`
	)

	xhr.addEventListener("readystatechange", function () {
		if (this.readyState === 4) {

			try {
				const data = JSON.parse(this.responseText)

				atualizarCampos(data, actionModeVal, _id)			
			} catch (e) {
				setActionLoading(false)
				console.log(e)
				return
			}

		}
	});

	xhr.send(null);
}

// req para atualizar os campos dos favoritos e lastVisited do usuário
const atualizarCampos = (data, actionModeVal, _id) => {

	let newData = {}

	let pilhaCandidatos = data[0].pilhaCandidatos
	let currentTarget = data[0].currentTarget

	if (pilhaCandidatos.length === 0)
		window.location.reload(false);

	// se o valor de _id for vazio significa que não há registro no banco de dados
	if (_id) {
		switch (actionModeVal) {
			case 'star':
				// adicionando aos favoritos do usuário
				let favoritos = data[0].favoritos
				if (!Array.isArray(favoritos))
					favoritos = []
				favoritos.push(_id)

				newData["favoritos"] = favoritos

				// removendo da pilha
				if (Array.isArray(pilhaCandidatos)) {
					const index = pilhaCandidatos.indexOf(_id)
					if (index > -1)
						pilhaCandidatos.splice(index, 1)
				}
				break
			case 'down':
				if (pilhaCandidatos.length > 1) {
					currentTarget--
					if (currentTarget < 0)
						currentTarget = pilhaCandidatos.length - 1	
					console.log(currentTarget)
				} else {
					currentTarget = 0
				}
				break
			case 'up':
				if (pilhaCandidatos.length > 1) {
					currentTarget++
					if (currentTarget > pilhaCandidatos.length - 1)
						currentTarget = 0
				} else {
					currentTarget = 0
				}
				break
		}
	}

	newData["pilhaCandidatos"] = pilhaCandidatos
	newData["currentTarget"] = currentTarget
	

	let xhr = reqHead(
		"PUT", 	`https://pisample-250e.restdb.io/rest/userdata/${data[0]._id}`
	)

	xhr.addEventListener("readystatechange", function () {
		if (this.readyState === 4) {

			try {
				const updatedData = JSON.parse(this.responseText)
				console.log(updatedData)

				if (actionModeVal === "star")
					window.location.reload(true)
				else
					updateCandidatoPanelInfo(updatedData.pilhaCandidatos[updatedData.currentTarget], actionMode)

			} catch (e) {
				setActionLoading(false)
				console.log(e)
				alert("Erro. Talvez seja necessário recarregar a página.")
			}

		}
	});

	xhr.send(JSON.stringify(newData));
}

const setActionLoading = (state) => {
	const loading = document.querySelector("#candidatoLoading")
	const panels = document.querySelectorAll("#candidatoPainel > *:not(.loading-div)")

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

const updateCandidatoPanelInfo = (targetId, actionMode) => {

	// se query estiver vazia, retirar o _id do usuário logado para que ele não possa se selecionar
	let xhr = reqHead("GET", `https://pisample-250e.restdb.io/rest/userdata?q={"_id": "${targetId}"}`)

	xhr.addEventListener("readystatechange", function () {
		if (this.readyState === 4) {

			try {
				const newData = JSON.parse(this.responseText)

				console.log(newData)

				const dataKeys = Object.keys(newData[0])

				for (let key in dataKeys) {
					if (!dataKeys[key].startsWith("_") 
						&& dataKeys[key] != "senha"
						&& dataKeys[key] != "id"
						&& dataKeys[key] != "accessKey"
						&& dataKeys[key] != "favoritos"
						&& dataKeys[key] != "lastVisited"
						&& dataKeys[key] != "next"
						&& dataKeys[key] != "current"
						&& dataKeys[key] != "pilhaCandidatos"
						&& dataKeys[key] != "preferencias"
					) {
						
						let userValue = document.querySelector(`#targetUser-${dataKeys[key]}`)

						if (userValue)
							userValue.innerHTML = newData[0][dataKeys[key]]
						if (dataKeys[key] === "idade")
							userValue.innerHTML += " Anos"
					}
				}
				setActionLoading(false)
			} catch (e) {
				setActionLoading(false)
				console.log(e)
				return
			}

		}
	});

	xhr.send(null);
}

const reqHead = (type, url) => {
	let xhr = new XMLHttpRequest();
	xhr.withCredentials = false;

	xhr.open(type, url)

	xhr.setRequestHeader("content-type", "application/json");
	xhr.setRequestHeader("x-apikey", "6112d0b769fac573b50a540e");
	xhr.setRequestHeader("cache-control", "no-cache");

	return xhr
}