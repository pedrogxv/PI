let putQuery = async (_id, userData, apikey, callback) => {
	if (_id == null) return;

	var request = require("request");

	var options = { 
		method: 'PUT',
		url: `https://pisample-250e.restdb.io/rest/userdata/${_id}`,
		headers: 
		{ 
			'cache-control': 'no-cache',
			'x-apikey': apikey,
			'content-type': 'application/json'
		},
		body: {
			experiencia: userData[0].experiencia,
			ensino: userData[0].ensino,
			nome: userData[0].nome,
			senha: userData[0].senha,
			email: userData[0].email,
			idade: userData[0].idade,
			accessKey: userData[0].accessKey
		},
		json: true
	};

	const putReq = new Promise ( 
		(resolve, reject) => {

			request(options, (error, response, body) => {
				if (error) {
					alert("Erro ao cadastrar: " + error)
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

	putReq.then(
		(returned) => {
			callback(returned)
		}
	)

}

module.exports = putQuery;