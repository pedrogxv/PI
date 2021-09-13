const removeLike = document.querySelectorAll(".removeLike")
const userDiv = document.querySelectorAll(".userCorner-userList-user")

let cookies = document.cookie
cookies = cookies.split(/[=, ;]+/)
console.log(cookies)

removeLike.forEach( (like, idx) => {

	like.addEventListener("click", () => {
		like.disabled = true

		let xhr = new XMLHttpRequest()

		if (!xhr) {
			alert('Erro na requisição! Recarregue a página.');
			return
		}

		xhr.addEventListener("readystatechange", function () {
			// quando a requsição der certo
			if (this.readyState === 4) {
				const data = JSON.parse(this.responseText)

				console.log(data[0]);

				// request2(data)
			}
		});

		xhr.open("GET", `https://pisample-250e.restdb.io/rest/userdata?q={"email":"${cookies[3]}","accessKey":"${cookies[1]}"}`);
		xhr.setRequestHeader("content-type", "application/json");
		xhr.setRequestHeader("x-apikey", "6112d0b769fac573b50a540e");
		xhr.setRequestHeader("cache-control", "no-cache");
		xhr.send(null)

	})

	// const request2 = (data) => {
		
	// 	let likes = data[0].likes

	// 	console.log("Data: " + likes)

	// 	if (typeof likes === "string") {
	// 		likes = likes.split(";")
	// 	}

	// 	likes.splice(likes.indexOf(like.value), 1)
	// 	likes = likes.join(";")

	// 	console.log("Joined: " + likes)

	// 	let put = JSON.stringify({
	// 		"likes": likes
	// 	});

	// 	let xhr = new XMLHttpRequest();
	// 	xhr.withCredentials = false;

	// 	xhr.addEventListener("readystatechange", function () {
	// 		if (this.readyState === 4) {
	// 			// removendo userDiv ao clicar em remover e a requisição der certo
	// 			userDiv[idx].remove()
	// 		}
	// 	});

	// 	xhr.open("PUT", `https://pisample-250e.restdb.io/rest/userdata/${data[0]._id}`);
	// 	xhr.setRequestHeader("content-type", "application/json");
	// 	xhr.setRequestHeader("x-apikey", "6112d0b769fac573b50a540e");
	// 	xhr.setRequestHeader("cache-control", "no-cache");

	// 	xhr.send(put);

	// }

})
