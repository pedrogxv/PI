let nomeField = document.querySelector("input[name='nome']").value

let emailField = document.querySelector("input[name='email']").value

let nomeField = document.querySelector("input[name='nome']").value


let reqGetUserHome = async (callback) => {
	var request = require("request");

	var options = { 
		method: 'POST',
		url: 'https://pisample-250e.restdb.io/rest/userdata',
		headers: 
		{ 
			'cache-control': 'no-cache',
			'x-apikey': 'd7932830591de2013a6dc369ad501ac687903' 
		},
		body: {
			nome: nomeField,
			email: email
		},
		json: true
	};

	const get = new Promise ( 
		(resolve, reject) => {
			request(options, (error, response, body) => {
				if (error) {
					throw new Error(error);
					reject(error)
				}

				if (body != null) {
					userData = JSON.parse(body)
					resolve(body)
				}

				setTimeout(() => {

					reject("timeout")

				}, 5000)

			})
		}
	)

	get.then(
		(returned) => {
			callback(returned)
		}
	)

}
