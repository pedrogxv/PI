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
const getInteresses = require("./scripts/database/getInteresses")

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
app.use(express.static(path.join(__dirname, '/styles')));

//Set up the Express router
router.get('/', async (req, res) => {

	let query = null

	if (req.cookies.senha && req.cookies.email) {

		const email = req.cookies.email
		const senha = req.cookies.senha

		// checando se email já existe no servidor "User Data"
		const pessoaQuery = JSON.parse(await dbQuery(`"$and": [{"email": "${email}"}, {"senha": "${senha}"}]`, apikey, "https://pisample-250e.restdb.io/rest/userdata?"))
		
		// checando se email já existe no servidor "Empresa Data"
		const empresaQuery = JSON.parse(await dbQuery(`"$and": [{"email": "${email}"}, {"senha": "${senha}"}]`, apikey, "https://pisample-250e.restdb.io/rest/empresadata?"))

		if (pessoaQuery != null)
			query = pessoaQuery
		if (empresaQuery != null)
			query = empresaQuery

		if (!query[0].imagem || !query[0].endereco || !query[0].contato || !query[0].areaInteresse || !query[0].areaInteresse2) {
			res.redirect("/complemento-info1")
		}
		else
			res.redirect("/user-home")

		if (!query)
			res.render(path.join(__dirname, 'views/cadastro-login.pug'));		

	} else {

		// callback se refere ao que é pra fazer se NÃO houver cookies
		res.render(path.join(__dirname, 'views/cadastro-login.pug'));

	}

});
app.use('/', router);

router.get("/complemento-info1", async (req, res) => {
	const email = req.cookies.email
	const senha = req.cookies.senha
	let query = null

	if (email && senha) {
		// checando se email já existe no servidor "User Data"
		const pessoaQuery = JSON.parse(await dbQuery(`"$and": [{"email": "${email}"}, {"senha": "${senha}"}]`, apikey, "https://pisample-250e.restdb.io/rest/userdata?"))
		
		// checando se email já existe no servidor "Empresa Data"
		const empresaQuery = JSON.parse(await dbQuery(`"$and": [{"email": "${email}"}, {"senha": "${senha}"}]`, apikey, "https://pisample-250e.restdb.io/rest/empresadata?"))


		if (pessoaQuery != null) {
			if (pessoaQuery.length > 0)
				query = pessoaQuery[0]
		}
		if (empresaQuery != null) {
			if (empresaQuery.length > 0)
				query = empresaQuery
		}
		
	} else {
		res.redirect("/")
	}

	const areasInteresse = JSON.parse(await getInteresses(apikey))
	
	res.render(path.join(__dirname, 'views/complemento-info.pug'), {
		"userData": query,
		"areasInteresse": areasInteresse[0]
	})
})

router.post("/complemento-info1", async (req, res) => {
	const userMode = req.cookies.userMode
	const url = userMode == "empresa" ? "https://pisample-250e.restdb.io/rest/empresadata/": "https://pisample-250e.restdb.io/rest/userdata/"
	if (req.cookies._id) {
		const parsed = await putQuery(req.cookies._id, {
			"imagem": req.body.imagem,
			"contato": req.body.contato,
			"endereco": req.body.endereco,
			"areaInteresse": req.body.areaInteresse1,
			"areaInteresse2": req.body.areaInteresse2,
			"links": req.body.links ? [req.body.links] : [],
		}, apikey, url)
		if (req.cookies.userMode == "empresa") {
			res.redirect("/user-home")
		}
		if (req.cookies.userMode == "pessoa") {
			res.redirect("/complemento-info2")
		}
	} else {
		res.redirect("/")
	}
})

router.get("/complemento-info2", async (req, res) => {
	const email = req.cookies.email
	const senha = req.cookies.senha

	try {
		// checando se email já existe no servidor "User Data"
		const pessoaQuery = JSON.parse(await dbQuery(`"$and": [{"email": "${email}"}, {"senha": "${senha}"}]`, apikey, "https://pisample-250e.restdb.io/rest/userdata?"))
		

		if (pessoaQuery == null) 
			throw "pessoaQuery null"
		if (pessoaQuery.length > 0)
			throw "nenhum usuário encontrado"

		res.render(path.join(__dirname, 'views/complemento-info.pug'), {
			"userData": pessoaQuery[0]
		})
	} catch (e) {
		console.log(e)
		res.redirect("/logout")
	}


})

// POST CADASTRO
router.post('/cadastro', async (req, res) => {

	try {
		
		const userMode = req.body.cpf ? "pessoa" : "empresa"
		const cpf = req.body.cpf || " "
		const cnpj = req.body.cnpj || " "

		if (userMode == "empresa" && cnpj.length != 14) {
			res.render(path.join(__dirname, '/views/cadastro-login.pug'), {
				"error": "CNPJ deve ter 14 dígitos!"
			});
			return
		}
		if (userMode == "pessoa" && cpf.length != 11) {
			res.render(path.join(__dirname, '/views/cadastro-login.pug'), {
				"error": "CPF deve ter 11 dígitos!"
			});
			return
		}

		// checando se email já existe no servidor "User Data"
		const pessoaQuery = JSON.parse(await dbQuery(`"$or":[{"email": "${req.body.email}"}, {"cpf": ${cpf}}]`, apikey, "https://pisample-250e.restdb.io/rest/userdata?"))
		
		// checando se email já existe no servidor "Empresa Data"
		const empresaQuery = JSON.parse(await dbQuery(`"$or": [{"email": "${req.body.email}"}, {"cnpj": ${cnpj}}]`, apikey, "https://pisample-250e.restdb.io/rest/empresadata?"))

		// se sim, não deixar cadastrar
		if (pessoaQuery.length > 0 || empresaQuery.length > 0) {
			res.render(path.join(__dirname, '/views/cadastro-login.pug'), {
				"error": "Email ou CPF/CNPJ já cadastrado, tente usar outro!"
			});
		}
		// senão, cadastrar
		else {

			if (userMode === "empresa") {
				const postQuery = await post({
					'nome': req.body.nome,
					'email': req.body.email,
					'senha': req.body.senha,
					'cnpj': req.body.cnpj,
					'favoritos': [],
					'links': [],
					'currentTarget': "",
					'descricao': "",
					'preferencias': [],
					'areaInteresse': "",
					'areaInteresse2': "",
					'pilhaCandidatos': []
				}, apikey, "https://pisample-250e.restdb.io/rest/empresadata")
			}
			else if (userMode === "pessoa") {
				const postQuery = await post({
					'nome': req.body.nome,
					'email': req.body.email,
					'idade': req.body.idade,
					'cpf': req.body.cpf,
					'senha': req.body.senha,
					'ensino': "",
					'experiencia': "",
					'favoritos': [],
					'links': [],
					'descricao': "",
					'preferencias': [],
					'cursos': "",
					'empresasViews': [],
					'contatoCount': [],
					'areaInteresse': "",
					'areaInteresse2': ""
				}, apikey, 'https://pisample-250e.restdb.io/rest/userdata')
			}
			else
				throw "User Mode não definido (index.js L.138)"

			res.render(path.join(__dirname, 'views/cadastro-login.pug'), {
				'success': "Usuário cadastrado! Faça o login para continuar."
			})

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

		let pessoaQuery = JSON.parse(await dbQuery(`"email":"${req.body.email}","senha":"${req.body.senha}"`, apikey, "https://pisample-250e.restdb.io/rest/userdata?"))

		let empresaQuery = JSON.parse(await dbQuery(`"email":"${req.body.email}","senha":"${req.body.senha}"`, apikey, "https://pisample-250e.restdb.io/rest/empresadata?"))

		if (!pessoaQuery[0] && !empresaQuery[0]) {
			throw "Verifique seu email e senha. Nenhum usuário encontrado!"
		}
			
		let query = pessoaQuery[0] ? pessoaQuery : empresaQuery

		let userMode = pessoaQuery[0] ? "pessoa" : "empresa"

		// gravando cookies
		res.cookie(`_id`,`${query[0]._id}`);
		res.cookie(`email`,`${query[0].email}`);
		res.cookie(`senha`,`${query[0].senha}`);
		res.cookie(`userMode`,`${userMode}`);

		if (!query[0].imagem || !query[0].endereco || !query[0].contato || !query[0].areaInteresse || !query[0].areaInteresse2) {
			res.redirect("/complemento-info1")
		}
		else
			res.redirect("/user-home")

	} catch (e) {
		console.log(e)
		res.render(path.join(__dirname, '/views/cadastro-login.pug'), {
			"error": e
		})
	}

});

router.get('/logout', (req, res) => {

	res.clearCookie("_id")
	res.clearCookie("email")
	res.clearCookie("senha")
	res.clearCookie("userMode")
	res.render(path.join(__dirname, 'views/cadastro-login.pug'), {
		"error": req.body.error
	});

});

router.get('/user-home', async (req, res) => {
		
	try {
		if (!req.cookies.senha || !req.cookies.email || !req.cookies.userMode)
			throw "No cookies!"

		let url = req.cookies.userMode == "pessoa" ? "https://pisample-250e.restdb.io/rest/userdata?" : "https://pisample-250e.restdb.io/rest/empresadata?"

		let query = JSON.parse(await queryThroughCookies(req, res))

		// se não encontrar um objeto na query
		// retornar e fazer logout (para excluir os cookies)
		if (!query[0])
			throw "Não foi encontrado nenhum usuário"

		// código para pegar os usuários com favorito do usuário
		let userFavorito = null

		let favoritos = query[0].favoritos

		if (Array.isArray(favoritos)) {
			favoritos = favoritos.map((value, idx) => {
				value = "\"" + value + "\""
				return value
			})

			// ternário checa se favArgs tem algum elemento, senão acrescentar aspas
			let favoritosQuery = `"_id": {"$in": [${favoritos}]}`

			let reversedUrl = req.cookies.userMode == "empresa" ? "https://pisample-250e.restdb.io/rest/userdata?" : "https://pisample-250e.restdb.io/rest/empresadata?"

			if (favoritos.length > 0)
				userFavorito =  JSON.parse(await dbQuery(favoritosQuery, apikey, reversedUrl))
		}
		// FIM DO CÓDIGO DOS FAVORITOS

		let targetUser = []
		if (req.cookies.userMode == "empresa") {
			let reqQuery = ''

			if (query[0].pilhaCandidatos) {
				if (query[0].currentTarget)
					reqQuery = `"_id": "${query[0].pilhaCandidatos[query[0].currentTarget]}"`
				else
					reqQuery = `"_id": "${query[0].pilhaCandidatos[0]}"`
			}

			targetUser = JSON.parse(await dbQuery(reqQuery, apikey, "https://pisample-250e.restdb.io/rest/userdata?", 'max=1')) /* max=1 é para limitar um result */
		}

		// Fim do código para pegar o candidato user
		
		const userData = query
		
		res.render(path.join(__dirname, '/views/user-home.pug'), {
			'userData': userData ? userData[0] : null,
			'userFavorito': userFavorito,
			'targetUser': targetUser ? targetUser[0] : null,
			'userMode': req.cookies.userMode
		});
		return

	} catch (e) {
		console.log(e)
		
		res.redirect(`/logout?"error":"${e}"`);
		return
	}

});

router.get('/mudar-senha', (req, res) => {

	res.render(path.join(__dirname, '/views/mudar-senha.pug'));

});

router.post('/mudar-senha', async (req, res) => {

	try {
		if (!req.body.senha1 || !req.body.senha2)
			throw "Preencha todos os campos!"
			
		if (req.body.senha1 != req.body.senha2)
			throw "Senhas não coincidem!"

		const _id = req.cookies._id
		const url = req.cookies.userMode == "pessoa" ? "https://pisample-250e.restdb.io/rest/userdata/" :
		"https://pisample-250e.restdb.io/rest/empresadata/"

		let newData = {
			"senha": req.body.senha2
		}

		const queryRes = await putQuery(_id, newData, apikey, url)

		res.redirect('/')
		
	} catch (e) {
		console.log(e)
		res.render(path.join(__dirname, 'views/mudar-senha.pug'), {
			"error": e
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
		const url = req.cookies.userMode == "pessoa" ? "https://pisample-250e.restdb.io/rest/userdata/" :
		"https://pisample-250e.restdb.io/rest/empresadata/"
		
		let newData = {}

		if (req.body.resetType == 'favoritos') {
			// reseta o valor de favoritos
			newData["favoritos"] = []
		}

		// salva o novo valor de query no bd
		await putQuery(_id, newData, apikey, url)

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

		await putQuery(_id, zerarPilha, apikey, "https://pisample-250e.restdb.io/rest/empresadata/")

		const interesse1 = req.body.areaInteresse
		const interesse2 = req.body.areaInteresse2

		const userData = JSON.parse(await dbQuery(`"_id":"${_id}"`, apikey, "https://pisample-250e.restdb.io/rest/empresadata?"))

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

		// removendo o _id e os favoritos da query, além de adicionado operador de or para pesquisa de interesses
		let pilhaData = JSON.parse(await dbQuery(`"$or": [{"areaInteresse":"${interesse1}"}, {"areaInteresse2":"${interesse2}"}], "_id": {"$not": "${_id}", "$nin": [${favoritos}]},"$distinct":"_id"`, apikey, "https://pisample-250e.restdb.io/rest/userdata?"))

		if (!Array.isArray(pilhaData)) {
			pilhaData = []
		}

		const newPilha = {
			"pilhaCandidatos": pilhaData,
			"currentTarget": 0
		}

		await putQuery(_id, newPilha, apikey, "https://pisample-250e.restdb.io/rest/empresadata/")

		if (pilhaData[0]) {
			let primeiroPilhaCandidato = JSON.parse(await dbQuery(`"_id":"${pilhaData[0]}"`, apikey, "https://pisample-250e.restdb.io/rest/userdata?"))

			// adicionando na empresasViews
			if (primeiroPilhaCandidato[0].empresasViews.indexOf(userData[0]._id) == -1) {

				primeiroPilhaCandidato[0].empresasViews.push(userData[0]._id)

				const newEmpresasViews = primeiroPilhaCandidato[0].empresasViews

				let newView = {
					"empresasViews": newEmpresasViews
				}

				await putQuery(primeiroPilhaCandidato[0]._id, newView, apikey, "https://pisample-250e.restdb.io/rest/userdata/")
			}
		}

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