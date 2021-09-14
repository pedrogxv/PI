const likeUp = document.querySelector("#target-action-up")
const likeDown = document.querySelector("#target-action-down")

likeUp.addEventListener('click', () => {makeActionRequest(true, event.target.value)})
likeDown.addEventListener('click', () => {makeActionRequest(false, event.target.value)})

let cookies = document.cookie
cookies = cookies.split(/[=, ;]+/)

const makeActionRequest = (like, _id) => {

	let xhr = new XMLHttpRequest();
	xhr.withCredentials = false;

	xhr.addEventListener("readystatechange", function () {
		if (this.readyState === 4) {
			const data = JSON.parse(this.responseText)
			console.log(data)
			request2(data, like, _id)
		}
	});

	xhr.open("GET", `https://pisample-250e.restdb.io/rest/userdata?q={"email": "${cookies[3]}", "senha": "${cookies[5]}"}`);
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
		targetFieldName = "dislikes"
		targetFieldValue = data[0].dislikes
	}

	if (typeof targetFieldValue === "string") {
		likes = likes.split(";")
	}

	targetFieldValue.push(_id)

	targetFieldValue = targetFieldValue.join(";")

	let newData = JSON.stringify({
		targetFieldName: "new value"
	});

	let xhr = new XMLHttpRequest();
	xhr.withCredentials = false;

	xhr.addEventListener("readystatechange", function () {
		if (this.readyState === 4) {
			console.log(this.responseText);
		}
	});

	xhr.open("PUT", `https://pisample-250e.restdb.io/rest/userdata/${data._id}`);
	xhr.setRequestHeader("content-type", "application/json");
	xhr.setRequestHeader("x-apikey", "6112d0b769fac573b50a540e");
	xhr.setRequestHeader("cache-control", "no-cache");

	xhr.send(newData);
}