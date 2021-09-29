const chatBtns = document.querySelectorAll(".btn-chat")
const avisoNoDataChat = document.querySelector("#aviso-no-data-chat")

let browserCookiesForChat = document.cookie
browserCookiesForChat = browserCookiesForChat.split(/[=, ;]+/)

chatBtns.forEach((btn) => {
	btn.addEventListener("click", () => {
		avisoNoDataChat.style.display = "none"
		setChatLoading(true)

		let xhr = new XMLHttpRequest();
		xhr.withCredentials = false;

		xhr.addEventListener("readystatechange", function () {
			if (this.readyState === 4) {
				try {
					const data = JSON.parse(this.responseText);

					if (data[0])
						aplicarDadosDoUsuarioNoChat(data[0])
					else
						throw ""
				} catch (e) {
					avisoNoDataChat.style.display = "block"
					console.log(e)
				}
			}
		});

		let targetId = btn.getAttribute("value")

		xhr.open("GET", browserCookiesForChat[7] == "candidato" ? `https://pisample-250e.restdb.io/rest/empresadata?q={"_id": "${targetId}"}` : `https://pisample-250e.restdb.io/rest/userdata?q={"_id": "${targetId}"}`);
		xhr.setRequestHeader("content-type", "application/json");
		xhr.setRequestHeader("x-apikey", "6112d0b769fac573b50a540e");
		xhr.setRequestHeader("cache-control", "no-cache");

		xhr.send(null);

	})
})

const aplicarDadosDoUsuarioNoChat = (data) => {
	const userInfo = document.querySelectorAll(".chatInfo")
	userInfo.forEach((info) => {
		if (data[`${info.name}`]) {
			if (info.name == "nome")
				info.innerHTML = data[info.name]
			if (info.name == "_id")
				info.setAttribute("value", data[info.name])
			if (info.name == "imagem")
				info.setAttribute("src", data[info.name])
			console.log(info.name)
		}
	})
	
	const userName = document.querySelectorAll(".chat-userName")
	userName.forEach((user) => user.innerHTML = data["nome"])

	const userPerfil = document.querySelectorAll(".chat-userPerfil")
	userPerfil.forEach((perfil) => perfil.setAttribute("value", data["_id"]))

	const userContato = document.querySelector(".chat-whatsapp")
	if (userContato) {
		userContato.href = `https://wa.me/${data["contato"]}`
		const userEmail = document.querySelector(".chat-email")
		userEmail.href = `mailto:${data["email"]}`
	} else {
		const contatoCountDom = document.querySelector("#contato-sim")
		contatoCountDom.setAttribute("value", data["_id"])
	}

	setChatLoading(false)
}

const setChatLoading = (state) => {
	const loading = document.querySelector("#chat-loading")
	const panels = document.querySelectorAll(".chat-head, .chat-body, .chat-footer")

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
			panel.style.display = "flex"
		})
	}
}