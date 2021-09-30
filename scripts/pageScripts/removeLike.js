const removeLike = document.querySelectorAll(".removeLike")
const userDiv = document.querySelectorAll(".userCorner-userList-user")

let cookies = document.cookie.split('; ').reduce((prev, current) => {
    const [name, ...value] = current.split('=');
    prev[name] = value.join('=');
    return prev;
}, {});

removeLike.forEach( (like, idx) => {

	like.addEventListener("click", () => {
		removeOnClick(like)
	})

	const removeOnClick = (like) => {
		setUserCornerLoading(true)
		like.disabled = true

		let xhr = new XMLHttpRequest()

		if (!xhr) {
			setUserCornerLoading(false)
			alert('Erro na requisição! Recarregue a página.');
			return
		}

		xhr.addEventListener("readystatechange", function () {
			// quando a requsição der certo
			if (this.readyState === 4) {

				try {
					const data = JSON.parse(this.responseText)

					console.log(data[0])

					if (!data.length) {
						throw ""
					}
					request2(data)
				} catch (e) {
					setUserCornerLoading(false)
					like.disabled = false
					console.log(e)
					alert("Erro na remoção. Recarregue a página ou faça login novamente.")
					return
				}

			}
		});

		xhr.open("GET", cookies.userMode == "candidato" ? `https://pisample-250e.restdb.io/rest/userdata?q={"email":"${cookies.email}","senha":"${cookies.senha}"}`
		: `https://pisample-250e.restdb.io/rest/empresadata?q={"email":"${cookies.email}","senha":"${cookies.senha}"}`);
		xhr.setRequestHeader("content-type", "application/json");
		xhr.setRequestHeader("x-apikey", "6112d0b769fac573b50a540e");
		xhr.setRequestHeader("cache-control", "no-cache");
		xhr.send(null)

	}

	const request2 = (data) => {
		
		let favoritos = data[0].favoritos

		favoritos.splice(favoritos.indexOf(like.getAttribute("value")), 1)

		console.log(favoritos)

		let put = JSON.stringify({
			"favoritos": favoritos
		});

		let xhr = new XMLHttpRequest();
		xhr.withCredentials = false;

		xhr.addEventListener("readystatechange", function () {
			if (this.readyState === 4) {
				try {
					let data = JSON.parse(this.responseText)
					// removendo userDiv ao clicar em remover e a requisição der certo
					resetarLikeTarget(like.value, data._id)

					userDiv[idx].remove()
				} catch (e) {
					console.log(e)
					setUserCornerLoading(false)
					like.disabled = false
				}

			}
		});

		xhr.open("PUT", cookies.userMode == "candidato" ? `https://pisample-250e.restdb.io/rest/userdata/${data[0]._id}`
		: `https://pisample-250e.restdb.io/rest/empresadata/${data[0]._id}`);
		xhr.setRequestHeader("content-type", "application/json");
		xhr.setRequestHeader("x-apikey", "6112d0b769fac573b50a540e");
		xhr.setRequestHeader("cache-control", "no-cache");

		xhr.send(put);

	}

	const resetarLikeTarget = (targetId, idToRemove) => {

		let xhr = new XMLHttpRequest();
		xhr.withCredentials = false;

		xhr.addEventListener("readystatechange", function () {
			if (this.readyState === 4) {
				const targetData = JSON.parse(this.responseText)
				
				console.log(JSON.parse(this.responseText))
				console.log(idToRemove)

				let favoritos = targetData[0].favoritos
				if (favoritos.indexOf(idToRemove) > -1) {
					console.log("Entrou aqui")
					favoritos.splice(favoritos.indexOf(idToRemove))
				}

				let put = JSON.stringify({
					"favoritos": favoritos
				});

				console.log(put)

				let xhr = new XMLHttpRequest();
				xhr.withCredentials = false;

				xhr.addEventListener("readystatechange", function () {
					if (this.readyState === 4) {

						console.log(JSON.parse(this.responseText))
						setUserCornerLoading(false)
						like.disabled = false

					}
				});

				xhr.open("PUT", cookies.userMode == "candidato" ?`https://pisample-250e.restdb.io/rest/empresadata/${targetId}`
				: `https://pisample-250e.restdb.io/rest/userdata/${targetId}`);
				xhr.setRequestHeader("content-type", "application/json");
				xhr.setRequestHeader("x-apikey", "6112d0b769fac573b50a540e");
				xhr.setRequestHeader("cache-control", "no-cache");

				xhr.send(put);
			}
		});

		xhr.open("GET", cookies.userMode == "candidato" ? 
		`https://pisample-250e.restdb.io/rest/empresadata?q={"_id":"${targetId}"}`
		: `https://pisample-250e.restdb.io/rest/userdata?q={"_id":"${targetId}"}`);
		xhr.setRequestHeader("content-type", "application/json");
		xhr.setRequestHeader("x-apikey", "6112d0b769fac573b50a540e");
		xhr.setRequestHeader("cache-control", "no-cache");

		xhr.send(null);
	}


})

const setUserCornerLoading = (state) => {
	const loading = document.querySelector("#cornerUsr-loading")
	const panels = document.querySelectorAll(".userCorner-userList-user")

	if (state) {
		loading.style.display = "block"
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