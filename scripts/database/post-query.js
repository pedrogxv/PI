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
			nome: data.nome,
			email: data.email,
			idade: data.idade,
			ensino: data.ensino,
			senha: data.senha,
			experiencia: data.exp,
			likes: data.likes,
			lastVisited: data.lastVisited,
			accessKey: data.accessKey,
			descrition: data.descrition,
			preferences: data.preferences,
			cursos: data.cursos
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

module.exports = post;