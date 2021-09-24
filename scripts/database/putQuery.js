let putQuery = async (id, newData, apikey, url) => {
	
	let request = require("request");

	let options = { 
		method: 'PUT',
		url: url + id,
		headers: 
		{ 
			'cache-control': 'no-cache',
			'x-apikey': apikey,
			'content-type': 'application/json'
		},
		body: newData,
		json: true
	};

	return new Promise ( 
		(resolve, reject) => {

			request(options, (error, response, body) => {
				if (error) {
					console.log("Erro no put query: " + error)
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

module.exports = putQuery;