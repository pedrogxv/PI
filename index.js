const express = require('express');//Set up the express module
const app = express();
const router = express.Router();
const path = require('path')//Include the Path module
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser')
// usando pug para geração de views
const pug = require('pug');

// require arquivos da pasta script
const dbQuery = require('./scripts/database/get-query')
const post = require('./scripts/database/post-query')
const putQuery = require('./scripts/database/putQuery')
const cookieCheck = require('./scripts/cookieCheck')
const queryThroughCookies = require('./scripts/database/queryThroughCookies')

// class
const UserData = require('./scripts/model/UserData')

const apikey = process.env['apikey']

// PARSE DE BODY, para requisições de FORM
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser())

// styles
app.use(express.static(path.join(__dirname, '/dist')));
//  scripts
app.use(express.static(path.join(__dirname, '/scripts')));
// user-home images
app.use(express.static(path.join(__dirname, '/imgs')));
app.use(express.static(path.join(__dirname, '/favicon')));

//Set up the Express router
router.get('/', async (req, res) => {

	cookieCheck(req, res, () => {
		res.sendFile(path.join(__dirname, 'index.html'));
	})

});
app.use('/', router);

app.get('/cadastro', async (req, res) => {

	const getInteresses = require("./scripts/database/getInteresses.js")

	const areasInteresse = JSON.parse(await getInteresses(apikey))

  	res.render(path.join(__dirname, 'views/cadastro.pug'), {
		'areasInteresse': areasInteresse[0]
	});
});

// POST CADASTRO
router.post('/cadastro', async (req, res) => {

	try {

		const getInteresses = require("./scripts/database/getInteresses.js")

		const areasInteresse = JSON.parse(await getInteresses(apikey))

		// checando se email já existe no servidor
		const query = JSON.parse(await dbQuery(`"email": "${req.body.email}"`,apikey))
		
		// se sim, não deixar cadastrar
		if (query.length > 0)
			res.render(path.join(__dirname, '/views/cadastro.pug'), {
				"areasInteresse": areasInteresse[0],
				"error": "Email existente, tente usar outro!"
			});
		
		// senão, cadastrar
		else {

			const userMode = req.body.userMode

			if (userMode === "empresa") {
				const postQuery = await post({
					'userMode': userMode,
					'nome': req.body.name,
					'email': req.body.email,
					'senha': req.body.senha,
					'favoritos': [],
					'links': "",
					'currentTarget': "",
					'descricao': req.body.descricao,
					'preferencias': [],
					'cnpj': req.body.cpf_cnpj,
					'areaInteresse': req.body.areaInteresse,
					'areaInteresse2': req.body.areaInteresse2,
					'pilhaCandidatos': []
				}, apikey)
			}
			else if (userMode === "pessoa") {
				const postQuery = await post({
					'userMode': userMode,
					'nome': req.body.name,
					'email': req.body.email,
					'idade': req.body.idade,
					'ensino': req.body.ensino,
					'senha': req.body.senha,
					'experiencia': req.body.experiencia,
					'favoritos': [],
					'links': "",
					'descricao': req.body.descricao,
					'preferencias': [],
					'cursos': "",
					'cpf': req.body.cpf_cnpj,
					'areaInteresse': req.body.areaInteresse,
					'areaInteresse2': req.body.areaInteresse2
				}, apikey)
			}
			else
				throw "User Mode não definido (index.js L.154)"

			res.redirect("/login")

		}

	} catch (e) {
		console.log(e)
		res.redirect("/");
	}

})

router.get('/login', (req, res) => {
	
	cookieCheck(req, res, () => {
		res.render(path.join(__dirname, 'views/login.pug'))
	})

})

router.post('/login', async (req, res) => {

	try {

		if (!req.body.email || !req.body.senha)
			throw "Campos de email e/ou senha vazios."

		let query = JSON.parse(await dbQuery(`"email":"${req.body.email}","senha":"${req.body.senha}"`, apikey))

		if (!query[0])
			throw "Nenhum usuário encontrado!"

		// gravando o novo accesskey no bd e no cookie
		res.cookie(`_id`,`${query[0]._id}`);
		res.cookie(`email`,`${query[0].email}`);
		res.cookie(`senha`,`${query[0].senha}`);

		res.redirect("/user-home")

	} catch (e) {
		console.log(e)
		res.render(path.join(__dirname, '/views/login.pug'), {
			"error": e
		})
	}

});

router.get('/logout', async (req, res) => {

	res.clearCookie("accessKey")
	res.clearCookie("email")
	res.clearCookie("senha")
	res.sendFile(path.join(__dirname, 'index.html'));

});

router.get('/user-home', async (req, res) => {
		
	// login with cookies
	if (req.cookies.senha && req.cookies.email) {
		
		try {

			let query = JSON.parse(await queryThroughCookies(req, res))

			// se não encontrar um objeto na query
			// retornar e fazer logout (para excluir os cookies)
			if (typeof query[0] != 'object') {
				res.redirect("/logout")
				return
			}

			// código para pegar os usuários com favorito do usuário
			let userFavorito = null

			let favoritos = query[0].favoritos

			if (typeof favoritos != "undefined" && !Array.isArray(favoritos)) {
				if (favoritos.length > 0) {

					// pegando os usuário que o usuário principal deu 'like'
					favoritos = query[0].favoritos.split(";")
					// // removendo último elemento do array (que é vazio)
					favoritos.pop()

					if (favoritos != null) {

						let favArgs = favoritos.map((value, idx) => {
							value = "\"" + value + "\""
							return value
						})

						// ternário checa se favArgs tem algum elemento, senão acrescentar aspas
						let favoritosQuery = `"_id": {"$in": [${favArgs.length > 0 ? favArgs : '\"\"'}]}`

						userFavorito =  JSON.parse(await dbQuery(favoritosQuery, apikey))

					}
				}
			}
			if (Array.isArray(favoritos)) {
				favoritos = favoritos.map((value, idx) => {
					value = "\"" + value + "\""
					return value
				})

				// ternário checa se favArgs tem algum elemento, senão acrescentar aspas
				let favoritosQuery = `"_id": {"$in": [${favoritos}]}`

				if (favoritos.length > 0)
					userFavorito =  JSON.parse(await dbQuery(favoritosQuery, apikey))
			}
			// FIM DO CÓDIGO DOS FAVORITOS

			let reqQuery = ''

			if (query[0].pilhaCandidatos) {
				if (query[0].currentTarget)
					reqQuery = `"_id": "${query[0].pilhaCandidatos[query[0].currentTarget]}"`
				else
					reqQuery = `"_id": "${query[0].pilhaCandidatos[0]}"`
			}

			let targetUser = JSON.parse(await dbQuery(reqQuery, apikey, 'max=1')) /* max=1 é para limitar um result */

			// Fim do código para pegar o candidato user

			try {
				if (targetUser[0].links)
					targetUser[0].links = targetUser[0].links.split(";")
				else {
					links = targetUser[0].links
					targetUser[0].links = [links]
				}

				if (targetUser[0].cursos)
					targetUser[0].cursos = targetUser[0].cursos.split(";")
				else {
					cursos = targetUser[0].cursos
					targetUser[0].cursos = [cursos]
				}
			} catch (e) {
				console.log(e)
			}
			
			const userData = query

			res.render(path.join(__dirname, '/views/user-home.pug'), {
				'userData': userData[0],
				'userFavorito': userFavorito,
				'targetUser': targetUser[0]
			});
			return

		} catch (e) {
			console.log(e)
			
			res.redirect("/logout");
			return
		}

	} else {
		res.redirect("/login?loginError=true")
		return

	}

});

router.get('/mudar-senha', (req, res) => {

	res.render(path.join(__dirname, '/views/mudar-senha.pug'));

});

router.post('/mudar-senha', async (req, res) => {

	if (req.body.senha1 && req.body.senha2) {
		if (req.body.senha1 == req.body.senha2) {

			try {	
				const _id = req.cookies._id
			
				let newData = {
					"senha": req.body.senha2
				}

				const queryRes = await putQuery(_id, newData, apikey)

				res.redirect('/')
				
			} catch (e) {
				console.log(e)
				res.render(path.join(__dirname, 'views/mudar-senha.pug'), {
					"error": `Ocorreu um erro, tente novamente!`
				})
			}

		} else {
			res.render(path.join(__dirname, 'views/mudar-senha.pug'), {
				"error": `Senhas não coincidem!`
			})
		}
	} else {
		res.render(path.join(__dirname, 'views/mudar-senha.pug'), {
				"error": `Campos não preenchidos.`
		})
	}

})

router.get('/confirmar-reset', async (req, res) => {
	
	let resetType = null

	if (req.query.favoritos) {
		resetType = "favoritos"
	}
	if (req.query.lastVisited) {
		resetType = "lastVisited"
	}

	res.render(path.join(__dirname, 'views/reset.pug'), {
		"resetType": resetType
	})

})

router.post('/reset', async (req, res) => {
	
	try {

		const _id = req.cookies._id
		
		let newData = {}

		if (req.body.resetType == 'favoritos') {
			// reseta o valor de favoritos
			newData["favoritos"] = []
		}
		if (req.body.resetType == 'lastVisited') {
			// reseta o valor de lastVisited
			newData["lastVisited"] = ""
		}

		// salva o novo valor de query no bd
		const queryRes = JSON.parse(await putQuery(_id, newData, apikey))

	} catch (e) {
		console.log(e)
	}

	res.redirect('/user-home')

})

router.post("/novaBusca", async (req, res) => {
	
	try {

		const _id = req.cookies._id

		const zerarPilha = {
			"pilhaCandidatos": []
		}

		await putQuery(_id, zerarPilha, apikey)

		const interesse1 = req.body.areaInteresse
		const interesse2 = req.body.areaInteresse2

		const userData = JSON.parse(await dbQuery(`"_id":"${_id}"`, apikey))

		let favoritos = userData[0].favoritos
		if (favoritos.length === 0) {
			favoritos = "\"\""
		}
		else {
			favoritos = favoritos.map((value, idx) => {
				value = "\"" + value + "\""
				return value
			})
		}

		// removendo o _id e os favoritos da query
		let pilhaData = JSON.parse(await dbQuery(`"$or": [{"areaInteresse":"${interesse1}"}, {"areaInteresse2":"${interesse2}"}], "_id": {"$not": "${_id}", "$nin": [${favoritos}]},"$distinct":"_id"`, apikey))

		if (!Array.isArray(pilhaData)) {
			pilhaData = []
			console.log("Passou aqui")
		}

		const newPilha = {
			"pilhaCandidatos": pilhaData,
			"currentTarget": 0
		}

		await putQuery(_id, newPilha, apikey)

		res.redirect("https://pi.pedrogxv.repl.co/user-home#candidatoPainel")

	} catch (e) {
		console.log(e)
		res.redirect('/logout?error')
	}

})

//set up the Express server to listen on port 3000 and logs some messages when the server is ready
let server = app.listen(3000, () => {
  console.log("App server is running on port 3000");
});