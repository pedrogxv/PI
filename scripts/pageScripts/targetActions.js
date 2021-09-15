
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
	setLoading(true)

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
				setLoading(false)
				console.log(e)
				return
			}

		}
	});

	xhr.send(null);
}

// req para atualizar os campos dos likes e dislikes do usuário
const request2 = (data, like, _id) => {

	let targetFieldName = null

	let targetFieldValue = null

	if (like) {
		targetFieldName = "likes"
		targetFieldValue = data[0].likes
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

				if (like) {
					setTargetData(likeUp.value)
				} else {
					const dislikes = data[0].dislikes.split(";")
					// enviando o último dislikes _id
					getDislikes(dislikes.slice(-1))
				}

				atualizarCandidato(updatedData)
			} catch (e) {
				setLoading(false)
				console.log(e)
				alert("Erro. Talvez seja necessário recarregar a página.")
			}

		}
	});

	xhr.send(newData);
}

const getDislikes = (dislikesId) => {

	const xhr = reqHead(
		"GET", 
		`https://pisample-250e.restdb.io/rest/userdata?q={"_id": "${dislikesId}"}`
	)

	xhr.addEventListener("readystatechange", function () {
		if (this.readyState === 4) {
			const dislikesUser = JSON.parse(this.responseText)
			atualizarCadastro(dislikesUser)
		}
	});

	xhr.send(null);
}

// req para pegar o próximo candidato
const atualizarCandidato = (data) => {

	let likes = null
	let dislikes = null

	try {
		likes = data.likes.split(";")
		dislikes = data.dislikes.split(";")
	} catch (e) {
		setLoading(false)
		console.log(e)
	}

	let notQuery = ""
	notQuery += `"_id": {"$not": {"$in": ["${data._id}"`

	if (dislikes && likes) {
		
		if (dislikes)
			if (notQuery.slice(-1) === "\"")
				notQuery += ","
			
			notQuery += `${dislikes.map((dis) => "\"" + dis + "\"")}`
		
		if (likes) {
			// se o último caracter do query for aspas, adicionar vírgula para não dar erro
			if (notQuery.slice(-1) === "\"")
				notQuery += ","

			notQuery += `${likes.map((like) => "\"" + like + "\"")}`
		}

	}

	notQuery += `]}}`

	let xhr = reqHead(
		"GET", 
		`https://pisample-250e.restdb.io/rest/userdata?q={${notQuery}}&max=1`
	)

	xhr.addEventListener("readystatechange", function () {
		if (this.readyState === 4) {
			try {
				const newTargetData = JSON.parse(this.responseText);

				const targetInfo = document.querySelectorAll(".target-info")

				// se a data[0] for indefinida, significa que os dados acabaram
				if (typeof newTargetData[0] == 'undefined') {
					window.location.reload(false)
					return
				}

				targetInfo.forEach((target) => {

					let targetData = newTargetData[0][target.attributes.name.value]

					if (target.attributes.name.value === "cursos" && targetData) {
						targetData = targetData.split(";")
					}

					if (
						(typeof targetData === "string" || 
						typeof targetData === "number") && (
							target.attributes.name.value != "links"
						)
					) {

						target.innerHTML = targetData.toString()

						if (target.attributes.name.value == "idade")
							target.innerHTML += " Anos"

					}

					if (target.attributes.name.value === "links" && targetData) {
					
						let links = []

						targetData = targetData.split(";")
					
						targetData.forEach((tData) => {
							const link = document.createElement("a")

							if (!tData.startsWith("http"))
								link.href = "http://"

							link.href += tData
							link.innerHTML = `${tData}`
						
							links.push(link)
						})

						const linkList = document.querySelector("ul.target-info[name='links']")

						links.forEach((linkAr) => {
							linkList.appendChild(linkAr)
						})

					}

				})

				likeUp.value = newTargetData[0]._id
				likeDown.value = newTargetData[0]._id

			} catch (e) {
				setLoading(false)
				alert("Houve um erro! Recarregue a página.")
				console.log(e)
			}
			setLoading(false)

		}
	});

	xhr.send(null);
}

const setTargetData = (targetId) => {
	
	let xhr = reqHead(
		"GET", 
		`https://pisample-250e.restdb.io/rest/userdata?q={"_id": "${targetId}"}`
	)

	xhr.addEventListener("readystatechange", function () {
		if (this.readyState === 4) {
			createCornerUser(JSON.parse(this.responseText)[0])
		}
	});

	xhr.send(null);
}

const createCornerUser = (dataObj) => {

	console.log(dataObj)

	const userList = document.createElement("div")
	userList.className = "userCorner-userList-user"

	const img = document.createElement("img")
	img.src = '/userSamples/felipao.jpg'
	img.alt = "User image"

	const userInfo = document.createElement("div")
	userInfo.className = "userInfo"

	const nome = document.createElement("h4")
	nome.innerHTML = `${dataObj.nome}`

	userInfo.appendChild(nome)

	const idade = document.createElement("p")
	idade.innerHTML = `${dataObj.idade} Anos`

	userInfo.appendChild(idade)

	const chatLink = document.createElement("a")
	chatLink.className = "btn btn-borderless btn-white bg-none btn-opacity no-link btn-chat btn-border-green"
	chatLink.href = "#chatPanel"

	const svgChat = document.createElement("svg")
	svgChat.className = "iconBtn iconBtn-noradius"
	svgChat.setAttribute("viewBox", "0 0 16 16"); 
	svgChat.setAttribute("fill", "currentColor")
	svgChat.setAttribute("xmlns", "http://www.w3.org/2000/svg")

	const pathChat1 = document.createElementNS('http://www.w3.org/svg', 'path')
	pathChat1.setAttribute("d", 'M14 1a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1h-2.5a2 2 0 0 0-1.6.8L8 14.333 6.1 11.8a2 2 0 0 0-1.6-.8H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2.5a1 1 0 0 1 .8.4l1.9 2.533a1 1 0 0 0 1.6 0l1.9-2.533a1 1 0 0 1 .8-.4H14a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z')

	svgChat.appendChild(pathChat1)

	const pathChat2 = document.createElementNS('http://www.w3.org/svg', 'path')
	pathChat2.setAttribute("d", 'M3 3.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zM3 6a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9A.5.5 0 0 1 3 6zm0 2.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5z')

	svgChat.appendChild(pathChat2)

	chatLink.appendChild(svgChat)

	const button = document.createElement("button")
	button.className = "btn btn-borderless btn-opacity bg-red btn-remover removeLike"
	button.value = `${dataObj._id}`

	userList.appendChild(img)
	userList.appendChild(userInfo)
	userList.appendChild(chatLink)
	userList.appendChild(button)
	
	const corner = document.querySelector(".userCorner-userList")
	corner.appendChild(userList)

	console.log(userList)
}

const setLoading = (state) => {
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