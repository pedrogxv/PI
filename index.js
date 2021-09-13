const express = require('express');//Set up the express module
const app = express();
const router = express.Router();
const path = require('path')//Include the Path module
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser')
// accessKey generator
const keyGenerator = require('uuid-apikey');
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

app.get('/cadastro', (req, res) => {
  	res.render(path.join(__dirname, 'views/cadastro.pug'));
});

// POST CADASTRO
router.post('/cadastro', async (req, res) => {

	// checando se email já existe no servidor
	const query = JSON.parse(await dbQuery(`"email": "${req.body.email}"`,apikey))
	
	// se sim, não deixar cadastrar
	if (query.length > 0)
		res.render(path.join(__dirname, '/views/cadastro.pug'), {
			"error": "Email existente, tente usar outro!"
		});
	
	// senão, cadastrar
	else {

		const postQuery = await post({
			'nome': req.body.name,
			'email': req.body.email,
			'idade': req.body.idade,
			'ensino': req.body.ensino,
			'senha': req.body.pwd,
			'experiencia': req.body.exp
		}, apikey)
		

		// tentar "ler" o json retornado
		try {
			
			console.log(typeof postQuery)
			res.redirect('/login');
		// se retornar erro
		} catch (e) {
			console.log(e)
			res.render(path.join(__dirname, '/views/cadastro.pug'), {
				"error": "Falha no cadastro, tente novamente."
			});
		}

	}

})

router.get('/login', (req, res) => {
	
	cookieCheck(req, res, () => {
		res.render(path.join(__dirname, 'views/login.pug'))
	})

})

router.post('/login', async (req, res) => {

	let query = JSON.parse(await dbQuery(`"email":"${req.body.email}","senha":"${req.body.senha}"`, apikey))

	try {

		let newAccessKey = keyGenerator.create().apiKey
		query[0].accessKey = newAccessKey

		// gravando o novo accesskey no bd e no cookie
		const loginQuery = await putQuery(query, apikey)
		
		res.cookie(`accessKey`,`${newAccessKey}`);
		res.cookie(`email`,`${query[0].email}`);
		res.redirect("/user-home")

	} catch {
		res.render(path.join(__dirname, '/views/login.pug'), {
			"error": "Falha no login! Verifique seu email e senha"
		})
	}

});

router.get('/logout', async (req, res) => {

	res.clearCookie("accessKey")
	res.clearCookie("email")
	res.sendFile(path.join(__dirname, 'index.html'));

});

router.get('/user-home', async (req, res) => {
		
	// login with cookies
	if (req.cookies.accessKey && req.cookies.email) {
		
		try {

			let query = JSON.parse(await queryThroughCookies(req, res))

			// se não encontrar um objeto na query
			// retornar e fazer logout (para excluir os cookies)
			if (typeof query[0] != 'object') {
				res.redirect("/logout")
				return
			}

			// código para pegar os usuários com like e "dislike" do usuário
			let likeUser = null

			let likes = query[0].likes

			if (likes.length > 0 && !Array.isArray(likes)) {
				// pegando os usuário que o usuário principal deu 'like'
				likes = query[0].likes.split(";")
				// // removendo último elemento do array (que é vazio)
				likes.pop()

				if (likes != null) {

						// pegando as informações de todos os usuários com like
						likeUser = await Promise.all(likes.map(async (like, idx) => {

							const likeQuery = JSON.parse(await dbQuery(`"_id":"${like}"`, apikey))

							return likeQuery[0]

						}))

				}
			}
			// FIM DO CÓDIGO DOS LIKES

			// INICIO DO CÓDIGO DISLIKES

			let dislikes = query[0].dislikes

			if (dislikes.length > 0 && !Array.isArray(dislikes)) {
				// pegando os usuário que o usuário principal deu 'like'
				dislikes = query[0].dislikes.split(";")
				// // removendo último elemento do array (que é vazio)
				dislikes.pop()
			}

			// FIM CÓDIGO DISLIKES

			// Inicio do código para pegar o candidato user

			let notQuery = ""

			if (dislikes || likes) {
				notQuery += `"_id": {"$not": {"$in": [`
				
				if (dislikes)
					notQuery += `${dislikes.map((dis) => "\"" + dis + "\"")}`
				
				if (likes) {
					// se o último caracter do query for aspas, adicionar vírgula para não dar erro
					if (notQuery.slice(-1) === "\"")
						notQuery += ","

					notQuery += `${likes.map((like) => "\"" + like + "\"")}`
				}

				notQuery += `]}}`
			}

			// A query not é para excluir os usuários não gostados ("diliked") e gostados ("likes")

			let targetUser = JSON.parse(await dbQuery(notQuery, apikey, 'max=1')) /* max=1 é para limitar um result */

			console.log(targetUser)

			// Fim do código para pegar o candidato user

			targetUser[0].links = targetUser[0].links.split(";")

			const userData = query

			res.render(path.join(__dirname, '/views/user-home.pug'), {
				'userData': userData[0],
				'likeUser': likeUser,
				'targetUser': targetUser[0]
			});
			return

		} catch (e) {
			console.log(e)
			
			res.redirect("/");
			return
		}

	} else {
		res.redirect("/login?cookie=false")
		return

	}

});

router.get('/mudar-senha', (req, res) => {

	res.render(path.join(__dirname, '/views/mudar-senha.pug'));

});

router.post('/mudar-senha', async (req, res) => {

	if (req.body.senha1 == req.body.senha2) {

		const query = JSON.parse(await queryThroughCookies(req, res))
		
		try {
			userData[0].senha = req.body.senha2

			const queryRes = await putQuery(query, apikey)

			res.redirect('/')
			
		} catch (e) {
			res.render(path.join(__dirname, 'views/mudar-senha.pug'), {
				"error": `Ocorreu um erro, tente novamente!`
			})
		}

	} else {
		res.render(path.join(__dirname, 'views/mudar-senha.pug'), {
			"error": `Senhas não coincidem!`
		})
	}

})

router.get('/confirmar-reset', async (req, res) => {
	
	res.render(path.join(__dirname, 'views/like-reset.pug'))

})

router.post('/reset-like', async (req, res) => {
	
	let query = JSON.parse(await queryThroughCookies(req, res))

	// reseta o valor de likes
	query[0].likes = ''

	// salva o novo valor de query no bd
	const queryRes = await putQuery(query, apikey)

	res.redirect('/')

})

//set up the Express server to listen on port 3000 and logs some messages when the server is ready
let server = app.listen(3000, () => {
  console.log("App server is running on port 3000");
});