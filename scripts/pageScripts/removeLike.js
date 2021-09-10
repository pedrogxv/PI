const removeLike = document.querySelector("#removeLike")

removeLike.addEventListener("click", () => {
	removeLike.disabled = true

	let xhr = new XMLHttpRequest()

	if (!xhr) {
      	alert('Erro na requisição! Recarregue a página.');
		return
	}

	xhr.addEventListener("readystatechange", function () {
		// quando a requsição der certo
		if (this.readyState === 4) {
			removeLike.disabled = false
			console.log(this.responseText);
		}
	});

	xhr.open("GET", "https://pisample-250e.restdb.io/rest/userdata");
	xhr.setRequestHeader("content-type", "application/json");
	xhr.setRequestHeader("x-apikey", "6112d0b769fac573b50a540e");
	xhr.setRequestHeader("cache-control", "no-cache");
	xhr.send(null)

})