let putQuery = async (userData, apikey) => {
	
	if (userData[0]._id == null) return;

	console

	var request = require("request");

	var options = { 
		method: 'PUT',
		url: `https://pisample-250e.restdb.io/rest/userdata/${userData[0]._id}`,
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
			accessKey: userData[0].accessKey,
			favoritos: userData[0].favoritos,
			lastVisited: userData[0].lastVisited
		},
		json: true
	};

	return new Promise ( 
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

}

module.exports = putQuery;