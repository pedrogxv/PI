const express = require('express');//Set up the express module
const app = express();
const router = express.Router();
const path = require('path')//Include the Path module
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser')
// accessKey generator
const keyGenerator = require('uuid-apikey');

// require arquivos da pasta script
const dbQuery = require('./scripts/database/get-query.js')
const post = require('./scripts/database/post-query.js')
const putAccessKey = require('./scripts/database/putAccessKey')
// class
const UserData = require('./scripts/model/UserData')

// usando pug para geração de views
const pug = require('pug');

let accessKey = null
// TODO: change apikey to process.env in replit
// const apikey = process.env['apikey']
const apikey = "d7932830591de2013a6dc369ad501ac687903"

// PARSE DE BODY, para requisições de FORM
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser())

// styles
app.use(express.static(path.join(__dirname, '/styles')));
//  scripts
app.use(express.static(path.join(__dirname, '/scripts')));
// user-home images
app.use(express.static(path.join(__dirname, '/user-home')));

//Set up the Express router
router.get('/', async (req, res) => {

	if (req.cookies.accessKey && req.cookies.email) {

		let userData = null
		accessKey = req.cookies.accessKey

		await dbQuery(`"accessKey": "${accessKey}", "email": "${req.cookies.email}"`, 
			apikey, (returned) => {
				userData = JSON.parse(returned)
				
				if (userData[0] != null)
					res.render(path.join(__dirname, 'views/user-home.pug'), {
						"userData": userData[0]
					});
				else
					res.sendFile(path.join(__dirname, 'index.html'));
				
			}
		).catch(() => {
			res.sendFile(path.join(__dirname, 'index.html'));
		})

	} else {
		res.sendFile(path.join(__dirname, 'index.html'));
	}

});
app.use('/', router);

router.get('/cadastro', (req, res) => {
  	res.render(path.join(__dirname, '/views/cadastro.pug'));
});
app.use('/cadastro', router);

router.get('/login', (req, res) => {
	res.render(path.join(__dirname, 'views/login.pug'))
})

router.post('/login-form', async (req, res) => {
  	
	console.log(req.body.email + req.body.senha)

	await dbQuery(`"email":"${req.body.email}","senha":"${req.body.senha}"`, 
		apikey, 
		async (returned) => {

			try {
				userData = JSON.parse(returned)
				console.log(userData)
				let newAccessKey = "768"
				userData[0].accessKey = newAccessKey

				// gravando o novo accesskey no bd e no cookie
				await putAccessKey(userData[0]._id, userData, 
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
app.use('/login-form', router);

// TODO: implementar logout
router.get('/logout', (req, res) => {
	res.clearCookie("accessKey")
	res.clearCookie("email")
	res.sendFile(path.join(__dirname, 'index.html'));
});
app.use('/logout', router);

router.get('/user-home', async (req, res) => {

	// login with accessKey
	if (req.cookies.accessKey && req.cookies.email) {

		await dbQuery(`"accessKey":"${req.cookies.accessKey}","email":"${req.cookies.email}"`, apikey, (returned) => {

			try {
				console.log(returned)
				const json = JSON.parse(returned)
				res.render(path.join(__dirname, '/views/user-home.pug'), {
					'userData': json[0]
				});
			} catch {
				res.redirect("/");
			}
			
		});

	}
	else {
		res.redirect("/login?accesskey=false")
	}

});
app.use('/user-home', router);

router.get('/loading', (req, res) => {

	res.render(path.join(__dirname, '/views/loading.pug'), {
		'pageTitle': 'Cadastrando...',
		'loadingTitle': "Cadastrando..."
	});

});
app.use('/loading', router);

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
				try {
					JSON.parse(returned)
					res.redirect('/login');
				} catch (e) {
					res.render(path.join(__dirname, '/views/cadastro.pug'), {
						"error": "Falha no cadastro, tente novamente."
					});
				}
			})

	})


})

//set up the Express server to listen on port 3000 and logs some messages when the server is ready
let server = app.listen(3000, function(){
  console.log("App server is running on port 3000");
});