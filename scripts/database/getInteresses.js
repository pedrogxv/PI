const getInteresses = (apikey) => {
	let request = require("request");
	let url = "https://pisample-250e.restdb.io/rest/areasInteresse"

	let options = { 
		method: 'GET',
		url: url,
		headers: 
		{ 
			'cache-control': 'no-cache',
			'x-apikey': apikey 
		}
	};


	return new Promise ( 
		(resolve, reject) => {

			request(options, (error, response, body) => {
				if (error) {
					console.log("Erro na requisição GET: " + error)
					reject(error)
					throw new Error(error);
				}

				if (body != null) {
					resolve(body)
				}

				setTimeout(() => {

					reject("timeout")

				}, 5000)

			})
		}
	)
}

module.exports = getInteresses