let post = async (data, apikey, callback) => {
	if (data == null) return;
	if (typeof data != "object") return;

	var request = require("request");

	var options = { 
		method: 'POST',
		url: 'https://pisample-250e.restdb.io/rest/userdata',
		headers: 
		{ 
			'cache-control': 'no-cache',
			'x-apikey': apikey ,
			'content-type': 'application/json'
		},
		body: {
			senha: data.senha,
			email: data.email,
			nome: data.nome,
			ensino: data.ensino,
			idade: data.idade,
			experiencia: data.experiencia
		},
		json: true
	};

	const post = new Promise ( 
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

	post.then(
		(returned) => {
			callback(returned)
		}
	)

}

module.exports = post;