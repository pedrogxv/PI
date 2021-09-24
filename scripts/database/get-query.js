// usando request para requisição ao Restdb JS API

let dbQuery = async (query, apikey, url, ext) => {
	let request = require("request");

	if (query) url += "q={" + query + "}&metafields=true"

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

module.exports = dbQuery