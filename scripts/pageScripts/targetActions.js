
const likeUp = document.querySelector("#target-action-up")
const likeDown = document.querySelector("#target-action-down")

likeUp.addEventListener('click', () => {
	makeActionRequest(true, likeUp.value)
})

likeDown.addEventListener('click', () => {
	makeActionRequest(false, likeDown.value)
})

let browserCookies = document.cookie
browserCookies = browserCookies.split(/[=, ;]+/)

const makeActionRequest = (like, _id) => {
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

				request2(data, like, _id)			
			} catch (e) {
				setActionLoading(false)
				console.log(e)
				return
			}

		}
	});

	xhr.send(null);
}

// req para atualizar os campos dos favoritos e dislikes do usuário
const request2 = (data, like, _id) => {

	let targetFieldName = null

	let targetFieldValue = null

	if (like) {
		targetFieldName = "favoritos"
		targetFieldValue = data[0].favoritos
	} else {
		targetFieldName = "dislikes"
		targetFieldValue = data[0].dislikes
	}

	if (typeof targetFieldValue === "string") {
		targetFieldValue = targetFieldValue.split(";")
	}

	console.log(targetFieldValue)

	// se o valor de 0 for vazio significa que não há registro no banco de dados
	if (typeof _id != 'undefined') {
		if (targetFieldValue[0] == '') {
			targetFieldValue[0] = _id
		}
		else {
			targetFieldValue.push(_id)
		}
	}

	console.log(targetFieldValue)

	targetFieldValue = targetFieldValue.join(";")
	targetFieldValue = targetFieldValue.replace(";;", ";")
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

const reqHead = (type, url) => {
	let xhr = new XMLHttpRequest();
	xhr.withCredentials = false;

	xhr.open(type, url)

	xhr.setRequestHeader("content-type", "application/json");
	xhr.setRequestHeader("x-apikey", "6112d0b769fac573b50a540e");
	xhr.setRequestHeader("cache-control", "no-cache");

	return xhr
}