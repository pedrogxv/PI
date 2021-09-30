const contatoCount = document.querySelector("#contato-sim")

let contatoCookies = document.cookie.split('; ').reduce((prev, current) => {
    const [name, ...value] = current.split('=');
    prev[name] = value.join('=');
    return prev;
}, {});

contatoCount.addEventListener("click", () => {

	let xhr = new XMLHttpRequest();
	xhr.withCredentials = false;

	let value = contatoCount.getAttribute("value")

	xhr.addEventListener("readystatechange", function () {
		if (this.readyState === 4) {
			const data = JSON.parse(this.responseText);

			if (data.contatoCount.indexOf(value) == -1)
				data.contatoCount.push(value)

			let xhr = new XMLHttpRequest();
			xhr.withCredentials = false;

			xhr.open("PUT", `https://pisample-250e.restdb.io/rest/userdata/${contatoCookies._id}`);
			xhr.setRequestHeader("content-type", "application/json");
			xhr.setRequestHeader("x-apikey", "6112d0b769fac573b50a540e");
			xhr.setRequestHeader("cache-control", "no-cache");

			xhr.send(JSON.stringfy({
				"contatoCount": data.contatoCount
			}));
		}
	});

	xhr.open("GET", `https://pisample-250e.restdb.io/rest/userdata/${contatoCookies._id}`);
	xhr.setRequestHeader("content-type", "application/json");
	xhr.setRequestHeader("x-apikey", "6112d0b769fac573b50a540e");
	xhr.setRequestHeader("cache-control", "no-cache");

	xhr.send(null);
})