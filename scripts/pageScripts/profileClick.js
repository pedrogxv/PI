const profileLinks = document.querySelectorAll(".profileLink")
const profileInfo = document.querySelectorAll(".profileInfo")
const avisoNoData = document.querySelector("#aviso-no-data")

const loadingTarget = document.querySelector("#perfilCandidatoLoading")

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
						throw ""
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

		xhr.open("GET", `https://pisample-250e.restdb.io/rest/userdata?q={"_id": "${targetId}"}`);
		xhr.setRequestHeader("content-type", "application/json");
		xhr.setRequestHeader("x-apikey", "6112d0b769fac573b50a540e");
		xhr.setRequestHeader("cache-control", "no-cache");

		xhr.send(null);

	})
	
})

const aplicarDataAosCampos = (data) => {

	profileInfo.forEach((info) => {
		const targetData = data[info.getAttribute("name")]
		if (typeof targetData == "undefined") {
			info.innerHTML = ""
		} else {
			info.innerHTML = targetData
		}

		if (info.getAttribute("name") === "idade")
			info.innerHTML += " Anos"
	})

	document.querySelector("#candidatoPanelBody").style.display = "block"
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