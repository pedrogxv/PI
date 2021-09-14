
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

let inRequest = false

const makeActionRequest = (like, _id) => {
	inRequest = true

	let xhr = new XMLHttpRequest();
	xhr.withCredentials = false;

	xhr.addEventListener("readystatechange", function () {
		if (this.readyState === 4) {
			try {
				if (!inRequest) {
					const data = JSON.parse(this.responseText)
				}
				
			} catch (e) {
				inRequest = false
				console.log(e)
				return
			}

			request2(data, like, _id)
		}
	});

	xhr.open("GET", `https://pisample-250e.restdb.io/rest/userdata?q={"email": "${browserCookies[3]}", "senha": "${browserCookies[5]}"}`);
	xhr.setRequestHeader("content-type", "application/json");
	xhr.setRequestHeader("x-apikey", "6112d0b769fac573b50a540e");
	xhr.setRequestHeader("cache-control", "no-cache");

	xhr.send(null);

}

const request2 = (data, like, _id) => {

	let targetFieldName = null

	let targetFieldValue = null

	if (like) {
		targetFieldName = "likes"
		targetFieldValue = data[0].likes
	} else {
		targetFieldName = "lastVisited"
		targetFieldValue = data[0].lastVisited
	}

	if (typeof targetFieldValue === "string") {
		targetFieldValue = targetFieldValue.split(";")
	}

	if (typeof _id != 'undefined') {
		if (_id) {
			targetFieldValue.push(_id)
		}
	}

	targetFieldValue = targetFieldValue.join(";")
	targetFieldValue = targetFieldValue.replace(";;", ";")
	targetFieldValue += ";"

	if (targetFieldValue.startsWith(";")) {
		targetFieldValue = targetFieldValue.substring(1)
	}

	let newData = JSON.stringify({
		[targetFieldName]: targetFieldValue
	});

	let xhr = new XMLHttpRequest();
	xhr.withCredentials = false;

	xhr.addEventListener("readystatechange", function () {
		if (this.readyState === 4) {
			
			try {
				if (!inRequest) {
					updatedData = JSON.parse(this.responseText)

					atualizarCandidato(updatedData)
				}
			} catch (e) {
				inRequest = false
				console.log(e)
				alert("Erro. Talvez seja necessário recarregar a página.")
			}

		}
	});

	xhr.open("PUT", `https://pisample-250e.restdb.io/rest/userdata/${data[0]._id}`);
	xhr.setRequestHeader("content-type", "application/json");
	xhr.setRequestHeader("x-apikey", "6112d0b769fac573b50a540e");
	xhr.setRequestHeader("cache-control", "no-cache");

	xhr.send(newData);
}

const atualizarCandidato = (data) => {

	let notQuery = ""

	let likes = null
	let lastVisited = null

	try {
		likes = data.likes.split(";")
		lastVisited = data.lastVisited.split(";")
	} catch (e) {
		console.log(e)
	}

	if (lastVisited && likes) {
		notQuery += `"_id": {"$not": {"$in": ["${data._id}"`
		
		if (lastVisited)
			if (notQuery.slice(-1) === "\"")
				notQuery += ","
			
			notQuery += `${lastVisited.map((dis) => "\"" + dis + "\"")}`
		
		if (likes) {
			// se o último caracter do query for aspas, adicionar vírgula para não dar erro
			if (notQuery.slice(-1) === "\"")
				notQuery += ","

			notQuery += `${likes.map((like) => "\"" + like + "\"")}`
		}

		notQuery += `]}}`
	}

	let xhr = new XMLHttpRequest();
	xhr.withCredentials = false;

	xhr.addEventListener("readystatechange", function () {
		if (this.readyState === 4) {
			try {
				const newTargetData = JSON.parse(this.responseText);

				const targetInfo = document.querySelectorAll(".target-info")

				targetInfo.forEach((target) => {


					let targetData = newTargetData[0][target.attributes.name.value]
					console.log(targetData)

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

						linkList.appendChild(links)

					}

				})
				inRequest = false

			} catch (e) {
				inRequest = false
				alert("Houve um erro! Recarregue a página.")
				console.log(e)
			}
		}
	});

	xhr.open("GET", `https://pisample-250e.restdb.io/rest/userdata?q={${notQuery}}&max=1`);
	xhr.setRequestHeader("content-type", "application/json");
	xhr.setRequestHeader("x-apikey", "6112d0b769fac573b50a540e");
	xhr.setRequestHeader("cache-control", "no-cache");

	xhr.send(null);

}