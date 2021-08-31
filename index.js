const express = require('express');//Set up the express module
const app = express();
const router = express.Router();
const path = require('path')//Include the Path module
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser')
// accessKey generator
const keyGenerator = require('uuid-apikey');

// require arquivos da pasta script
const dbQuery = require('./scripts/database/get-query')
const post = require('./scripts/database/post-query')
const putQuery = require('./scripts/database/putQuery')
const cookieCheck = require('./scripts/cookieCheck')
const queryThroughCookies = require('./scripts/database/queryThroughCookies')

// class
const UserData = require('./scripts/model/UserData')

// usando pug para geração de views
const pug = require('pug');

const apikey = process.env['apikey']

// PARSE DE BODY, para requisições de FORM
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser())

// styles
app.use(express.static(path.join(__dirname, '/styles')));
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
  	
	console.log(req.body.email + req.body.senha)

	await dbQuery(`"email":"${req.body.email}","senha":"${req.body.senha}"`, 
		apikey, 
		async (returned) => {

			try {
				userData = JSON.parse(returned)
				console.log(userData)
				let key = keyGenerator.create()
				let newAccessKey = key.apiKey
				userData[0].accessKey = newAccessKey

				// gravando o novo accesskey no bd e no cookie
				await putQuery(userData[0]._id, userData, 
					apikey, (returned) => {
						res.cookie(`accessKey`,`${newAccessKey}`);
						res.cookie(`email`,`${userData[0].email}`);
						res.redirect("/user-home")
				})

			} catch {
				res.render(path.join(__dirname, '/views/login.pug'), {
					"error": "Falha no login! Verifique seu email e senha"
				})
			}
			
		}
	)
	
});

router.get('/logout', (req, res) => {

	res.clearCookie("accessKey")
	res.clearCookie("email")
	res.sendFile(path.join(__dirname, 'index.html'));

});

router.get('/user-home', async (req, res) => {

	// login with accessKey
	if (req.cookies.accessKey && req.cookies.email) {

		queryThroughCookies(req, res, (returned) => {

			try {
				const userData = JSON.parse(returned)
				res.render(path.join(__dirname, '/views/user-home.pug'), {
					'userData': userData[0]
				});
			} catch {
				res.redirect("/");
			}

		})
		
	}
	else {
		res.redirect("/login?accesskey=false")
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
	await dbQuery(`"email": "${req.body.email}"`, apikey, async (returned) => {
		
		// se sim, não deixar cadastrar
		if (JSON.parse(returned).length > 0)
			res.render(path.join(__dirname, '/views/cadastro.pug'), {
				"error": "Email existente, tente usar outro!"
			});
		
		// senão, cadastrar
		else 
			await post({
				'nome': req.body.name,
				'email': req.body.email,
				'idade': req.body.idade,
				'ensino': req.body.ensino,
				'senha': req.body.pwd,
				'experiencia': req.body.exp
			}, apikey, (returned) => {

				// tentar "ler" o json retornado
				try {
					JSON.parse(returned)
					res.redirect('/login');
				// se retornar erro
				} catch (e) {
					res.render(path.join(__dirname, '/views/cadastro.pug'), {
						"error": "Falha no cadastro, tente novamente."
					});
				}
			})

	})

})

router.get('/mudar-senha', (req, res) => {

	res.render(path.join(__dirname, '/views/mudar-senha.pug'));

});

router.post('/mudar-senha', async (req, res) => {

	if (req.body.senha1 == req.body.senha2) {

		queryThroughCookies(req, res, async (returned) => {
			console.log(returned)
			try {
				let userData = JSON.parse(returned)
				userData[0].senha = req.body.senha2

				await putQuery(userData[0]._id, userData, apikey, (returned) => {

					res.redirect('/')
					
				})

			} catch (e) {
				res.render(path.join(__dirname, 'views/mudar-senha.pug'), {
					"error": `Ocorreu um erro, tente novamente!`
				})
			}
			
		})

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