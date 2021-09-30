const profileLinks = document.querySelectorAll(".profileLink")
const profileInfo = document.querySelectorAll(".profileInfo")
const avisoNoData = document.querySelector("#aviso-no-data")

const loadingTarget = document.querySelector("#perfilCandidatoLoading")

let browserCookiesForProfile = document.cookie.split('; ').reduce((prev, current) => {
    const [name, ...value] = current.split('=');
    prev[name] = value.join('=');
    return prev;
}, {});

profileLinks.forEach((profileLink) => {

	profileLink.addEventListener('click', () => {
		setLoading(true)

		let xhr = new XMLHttpRequest();
		xhr.withCredentials = false;

		xhr.addEventListener("readystatechange", function () {
			if (this.readyState === 4) {
				try {
					const data = JSON.parse(this.responseText);

					if (data[0]) {
						aplicarDataAosCampos(data[0])
					} else {
						throw "No Data"
					}
				} catch (e) {
					avisoNoData.style.display = "block"
					setLoading(false)
					console.log(e)
					alert("Não foram encontradas informações deste usuário. Recarregue a página ou faça login novamente.")
				}
			}
		});

		let targetId = profileLink.getAttribute("value")

		xhr.open("GET", browserCookiesForProfile.userMode == "candidato" ? `https://pisample-250e.restdb.io/rest/empresadata?q={"_id": "${targetId}"}` : `https://pisample-250e.restdb.io/rest/userdata?q={"_id": "${targetId}"}`);
		xhr.setRequestHeader("content-type", "application/json");
		xhr.setRequestHeader("x-apikey", "6112d0b769fac573b50a540e");
		xhr.setRequestHeader("cache-control", "no-cache");

		xhr.send(null);

	})
	
})

const aplicarDataAosCampos = (data) => {

	const gerarFieldSet = () => {
		const userFieldSet = document.createElement("div")
		userFieldSet.className = "flex justify-content-between user-fieldset"

		return userFieldSet
	}
	
	let e = document.querySelector("#candidatoPanelBody")
	//e.firstElementChild can be used.
	let child = e.lastElementChild;
	while (!child.className.includes("profileHead")) {
		e.removeChild(child);
		child = e.lastElementChild;
	}

	const dataKeys = Object.keys(data)

	let fieldSet = null

	let count = 0
	for (let key in dataKeys) {
		if (count > 1) {
			count = 0
		}

		console.log(count)

		if (!dataKeys[key].startsWith("_") 
			&& !dataKeys[key].startsWith("areaInteresse") 
			&& dataKeys[key] != "senha"
			&& dataKeys[key] != "id"
			&& dataKeys[key] != "userMode"
			&& dataKeys[key] != "accessKey"
			&& dataKeys[key] != "favoritos"
			&& dataKeys[key] != "lastVisited"
			&& dataKeys[key] != "next"
			&& dataKeys[key] != "currentTarget"
			&& dataKeys[key] != "empresasViews"
			&& dataKeys[key] != "pilhaCandidatos"
			&& dataKeys[key] != "preferencias"
		) {

			if (dataKeys[key] == "nome") {
				document.querySelector(".profileInfo[name='nome']").innerHTML = data[dataKeys[key]]
				continue
			}
			if (dataKeys[key] == "idade") {
				document.querySelector(".profileInfo[name='idade']").innerHTML = data[dataKeys[key]] + " Anos"
				continue
			}
			if (dataKeys[key] == "imagem") {
				document.querySelector(".profileInfo[name='imagem']").src = data[dataKeys[key]]
				continue
			}

			if (count == 0 || !fieldSet)
				fieldSet = gerarFieldSet()

			const flexDiv = document.createElement("div")
			flexDiv.className = 'flex direction-column'
			flexDiv.style.margin = "30px"
			if (count === 1) {
				flexDiv.style.textAlign = "end"
			}

			fieldSet.appendChild(flexDiv)

			const label = document.createElement("label")
			label.setAttribute("for", dataKeys[key])
			label.innerHTML = `${dataKeys[key].at(0).toUpperCase()}${dataKeys[key].slice(1)}`

			flexDiv.appendChild(label)

			const profileInfo = document.createElement("div")
			profileInfo.className = "profileInfo"
			profileInfo.setAttribute("name", dataKeys[key])
			profileInfo.innerHTML = data[dataKeys[key]]

			flexDiv.appendChild(profileInfo)

			if (count === 1) {
				const panelBody = document.querySelector("#candidatoPanelBody")
				panelBody.appendChild(fieldSet)
			}

			++count
		}

	}

	setLoading(false)
}

const setLoading = (state) => {
	const loading = document.querySelector("#perfilCandidatoLoading")
	const panels = document.querySelectorAll("#candidatoPanelBody")

	if (state) {
		avisoNoData.style.display = "none"
		loading.style.display = "block"
		console.log(loading.style.display)
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