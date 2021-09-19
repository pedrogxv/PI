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

				console.log(data)

				request2(data, actionModeVal, _id)			
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
const request2 = (data, actionModeVal, _id) => {

	let targetFieldName = null

	let targetFieldValue = null

	switch (actionModeVal) {
		case 'star':
			targetFieldName = "favoritos"
			targetFieldValue = data[0].favoritos
			break
		case 'down':
			targetFieldName = "next"
			targetFieldValue = data[0].next
			break
		case 'up':
			targetFieldName = "lastVisited"
			targetFieldValue = data[0].lastVisited
			break
	}

	// console.lg(data[0].favoritos)
	// console.lg(typeof data[0].favoritos)

	if (typeof targetFieldValue === "string") {
		targetFieldValue = targetFieldValue.split(";")
	}

	// se o valor de 0 for vazio significa que não há registro no banco de dados
	if (_id) {
		if (targetFieldValue[0] == '') {
			targetFieldValue[0] = _id
		}
		else {
			targetFieldValue.push(_id)
		}
	}

	// se largura do array for maior q um
	if (targetFieldValue.length > 1)
		targetFieldValue = targetFieldValue.join(";")
	// senão, como o join não vai funcionar, incrementar ";"
	else
		targetFieldValue += ";"

	// se começar com ";", excluir o primeiro valor
	if (targetFieldValue.startsWith(";")) {
		targetFieldValue = targetFieldValue.substring(1)
	}

	let newData = JSON.stringify({
		[targetFieldName]: targetFieldValue
	});

	let xhr = reqHead(
		"PUT", 	`https://pisample-250e.restdb.io/rest/userdata/${data[0]._id}`
	)

	xhr.addEventListener("readystatechange", function () {
		if (this.readyState === 4) {

			try {
				const updatedData = JSON.parse(this.responseText)
				window.location.reload(true)

			} catch (e) {
				setActionLoading(false)
				console.log(e)
				alert("Erro. Talvez seja necessário recarregar a página.")
			}

		}
	});

	xhr.send(newData);
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

const updateCandidatoPanelInfo = (data, actionMode) => {

	const query = ""

	if (actionMode == 'up') {
		query
	}

	let xhr = reqHead("GET", `https://pisample-250e.restdb.io/rest/userdata/${data[0]._id}`)
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