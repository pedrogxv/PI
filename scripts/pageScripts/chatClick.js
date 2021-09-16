const chatBtns = document.querySelectorAll(".btn-chat")
const avisoNoDataChat = document.querySelector("#aviso-no-data-chat")

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
					console.log(data)
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

		xhr.open("GET", `https://pisample-250e.restdb.io/rest/userdata?q={"_id": "${targetId}"}`);
		xhr.setRequestHeader("content-type", "application/json");
		xhr.setRequestHeader("x-apikey", "6112d0b769fac573b50a540e");
		xhr.setRequestHeader("cache-control", "no-cache");

		xhr.send(null);

	})
})

const aplicarDadosDoUsuarioNoChat = (data) => {
	const userName = document.querySelectorAll(".chat-userName")
	userName.forEach((user) => user.innerHTML = data["nome"])

	const userPerfil = document.querySelectorAll(".chat-userPerfil")
	userPerfil.forEach((perfil) => perfil.setAttribute("value", data["_id"]))

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