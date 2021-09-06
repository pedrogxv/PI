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

router.get('/login', (req, res) => {
	
	cookieCheck(req, res, () => {
		res.render(path.join(__dirname, 'views/login.pug'))
	})

})

router.post('/login-form', async (req, res) => {

	let query = JSON.parse(await dbQuery(`"email":"${req.body.email}","senha":"${req.body.senha}"`, apikey))

	try {

		let newAccessKey = keyGenerator.create().apiKey
		query[0].accessKey = newAccessKey

		// gravando o novo accesskey no bd e no cookie
		const loginQuery = await putQuery(query[0]._id, query, apikey)
		
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
		
	// login with accessKey
	if (req.cookies.accessKey && req.cookies.email) {

		let query = JSON.parse(await queryThroughCookies(req, res))
		console.log(query)

		// se não encontrar um objeto na query
		// retornar e fazer logout (para excluir os cookies)
		if (typeof query[0] != 'object') {
			res.redirect("/logout")
			return
		}

		let likeUser = null

		if (query[0].likes.length > 0) {
			// pegando os usuário que o usuário principal deu 'like'
			let likes = query[0].likes.split(";")
			// // removendo último elemento do array (que é vazio)
			likes.pop()


			if (likes != null) {
				if (likes.length > 0) {

					// pegando as informações de todos os usuários com like
					likeUser = await Promise.all(likes.map(async (like, idx) => {

						const likeQuery = JSON.parse(await dbQuery(`"_id":"${like}"`, apikey))

						return likeQuery[0]

					}))

				}
			}
		}

		try {

			const userData = query

			res.render(path.join(__dirname, '/views/user-home.pug'), {
				'userData': userData[0],
				'likeUser': likeUser
			});
			return

		} catch {
			res.redirect("/");
			return
		}

	} else {
		res.redirect("/login?cookie=false")
		return

	}

});

router.get('/loading', (req, res) => {

	res.render(path.join(__dirname, '/views/loading.pug'), {
		'pageTitle': 'Cadastrando...',
		'loadingTitle': "Cadastrando..."
	});

});

// POST CADASTRO
router.post('/post-cadastro', async (req, res) => {

	// checando se email já existe no servidor
	const query = await dbQuery(`"email": "${req.body.email}"`,apikey)
	
	// se sim, não deixar cadastrar
	if (JSON.parse(query).length > 0)
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
			JSON.parse(postQuery)
			res.redirect('/login');
		// se retornar erro
		} catch (e) {
			res.render(path.join(__dirname, '/views/cadastro.pug'), {
				"error": "Falha no cadastro, tente novamente."
			});
		}

	}

})

router.get('/mudar-senha', (req, res) => {

	res.render(path.join(__dirname, '/views/mudar-senha.pug'));

});

router.post('/mudar-senha', async (req, res) => {

	if (req.body.senha1 == req.body.senha2) {

		const query = await queryThroughCookies(req, res)
		
		console.log(query)

		try {
			let userData = JSON.parse(query)
			userData[0].senha = req.body.senha2

			const queryRes = await putQuery(userData[0]._id,userData, apikey)

			res.redirect('/')
			
		} catch (e) {
			res.render(path.join(__dirname, 'views/mudar-senha.pug'), {
				"error": `Ocorreu um erro, tente novamente!`
			})
		}
		

	} else {
		res.render(path.join(__dirname, 'views/mudar-senha.pug'), {
			"error": `Senhas não se coincidem!`
		})
	}

})

//set up the Express server to listen on port 3000 and logs some messages when the server is ready
let server = app.listen(3000, function(){
  console.log("App server is running on port 3000");
});