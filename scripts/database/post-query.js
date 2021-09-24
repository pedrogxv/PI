let post = async (data, apikey, url) => {
	if (data == null) return;
	if (typeof data != "object") return;

	var request = require("request");
	var options = { 
		method: 'POST',
		url: url,
		headers: 
		{ 
			'cache-control': 'no-cache',
			'x-apikey': apikey,
			'content-type': 'application/json'
		},
		body: data,
		json: true
	};

	return new Promise ( 
		(resolve, reject) => {

			request(options, (error, response, body) => {
				if (error) {
					console.log("Erro ao cadastrar: " + error)
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

module.exports = post;