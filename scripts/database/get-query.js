// usando request para requisição ao Restdb JS API
let dbQuery = async (query, apikey, callback) => {
	var request = require("request");

	var options = { 
		method: 'GET',
		url: `https://pisample-250e.restdb.io/rest/userdata?q={${query}}`,
		headers: 
		{ 
			'cache-control': 'no-cache',
			'x-apikey': apikey 
		} 
	};

	const get = new Promise ( 
		(resolve, reject) => {

			request(options, (error, response, body) => {
				if (error) {
					alert("Erro na requisição GET: " + error)
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

	get.then(
		(returned) => {
			console.log(returned)
            console.log(JSON.parse(returned))
			callback(returned)
		}
	)

}

module.exports = dbQuery