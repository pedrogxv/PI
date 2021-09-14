const likeUp = document.querySelector("#target-action-up")
const likeDown = document.querySelector("#target-action-down")

likeUp.addEventListener('click', (event) => {
	console.log("TESTE")
	console.log(event.target.value)
	makeActionRequest(true, event.target.value)
})

likeDown.addEventListener('click', (event) => {makeActionRequest(false, event.target.value)})

let browserCookies = document.cookie
browserCookies = browserCookies.split(/[=, ;]+/)

const makeActionRequest = (like, _id) => {
	console.log("ID: " + _id)

	let xhr = new XMLHttpRequest();
	xhr.withCredentials = false;

	xhr.addEventListener("readystatechange", function () {
		if (this.readyState === 4) {
			const data = JSON.parse(this.responseText)

			console.log("Teste: ")
			console.log(data)

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
		console.log("Splited" + targetFieldValue)
	}

	targetFieldValue.push(_id)
	console.log("Pushed: " + targetFieldValue)

	targetFieldValue = targetFieldValue.join(";")
	console.log("Pushed: " + targetFieldValue)

	let newData = JSON.stringify({
		[targetFieldName]: targetFieldValue
	});

	let xhr = new XMLHttpRequest();
	xhr.withCredentials = false;

	xhr.addEventListener("readystatechange", function () {
		if (this.readyState === 4) {
			console.log(this.responseText);
		}
	});

	xhr.open("PUT", `https://pisample-250e.restdb.io/rest/userdata/${data[0]._id}`);
	xhr.setRequestHeader("content-type", "application/json");
	xhr.setRequestHeader("x-apikey", "6112d0b769fac573b50a540e");
	xhr.setRequestHeader("cache-control", "no-cache");

	xhr.send(newData);
}