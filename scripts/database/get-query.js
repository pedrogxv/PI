// usando request para requisição ao Restdb JS API

let dbQuery = async (query, apikey, ext) => {
	let request = require("request");

	let url = "https://pisample-250e.restdb.io/rest/userdata?"
	if (query) url += "q={" + query + "}"

	if (ext) url += "&" + ext;

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

}

module.exports = dbQuery