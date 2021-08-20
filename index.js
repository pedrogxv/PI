const express = require('express');//Set up the express module
const app = express();
const router = express.Router();
const path = require('path')//Include the Path module
const bodyParser = require('body-parser');

// usando pug para geração de views
const pug = require('pug');

let userData = "null"
let userId = null
const apikey = process.env['apikey']

// PARSE DE BODY, para requisições de FORM
app.use(bodyParser.urlencoded({ extended: true }));

// styles
app.use(express.static(path.join(__dirname, '/styles')));
//  scripts
app.use(express.static(path.join(__dirname, '/scripts')));
// user-home images
app.use(express.static(path.join(__dirname, '/user-home')));

// usando request para requisição ao Restdb JS API
let reqGetUser = async (userId, callback) => {
	var request = require("request");

	var options = { 
		method: 'GET',
		url: `https://pisample-250e.restdb.io/rest/userdata?q={"id": ${userId}}`,
		headers: 
		{ 
			'cache-control': 'no-cache',
			'x-apikey': apikey 
		} 
	};

	const get = new Promise ( 
		(resolve, reject) => {

			request(options, (error, response, body) => {
				if (error) {
					throw new Error(error);
					alert("Erro na requisição GET: " + error)
					reject(error)
				}

				if (body != null) {
					userData = JSON.parse(body)
					resolve(body)
				}

				setTimeout(() => {

					reject("timeout")

				}, 5000)

			})
		}
	)

	get.then(
		(returned) => {
			callback(returned)
		}
	)

}

let post = async (data, callback) => {
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
					throw new Error(error);
					alert("Erro ao cadastrar: " + error)
					reject(error)
				}

				if (body != null) {
					userData = data
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

//Set up the Express router
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});
app.use('/', router);

router.get('/cadastro', (req, res) => {
  	res.sendFile(path.join(__dirname, '/views/cadastro.html'));
});
app.use('/cadastro', router);

router.post('/post-login', async (req, res) => {
  	
	// await reqGetUser()
	
});
app.use('/post-login', router);

router.get('/login', (req, res) => {
  	res.sendFile(path.join(__dirname, '/views/login.html'));
});
app.use('/login', router);

router.get('/user-home-pug', async (req, res) => {

	if (accessKey != null) {
		await reqGetUser(`{'accesskey': ${accessKey}}`, () => {
			res.render(path.join(__dirname, '/views/user-home.pug'), {
				'userData': userData[0]
			});
		});
	}
	else {
		res.redirect("/login")
	}

});
app.use('/user-home-pug', router);

router.get('/loading', (req, res) => {

	res.render(path.join(__dirname, '/views/loading.pug'), {
		'pageTitle': 'Cadastrando...',
		'loadingTitle': "Cadastrando..."
	});

});
app.use('/loading', router);

// POST CADASTRO
router.post('/post-cadastro', async (req, res) => {

	await post({
		'nome': req.body.name,
		'email': req.body.email,
		'idade': req.body.idade,
		'ensino': req.body.ensino,
		'senha': req.body.pwd,
		'experiencia': req.body.exp
	}, () => {
		res.redirect('/user-home-pug');
		console.log("OK")
	})

})
app.use('teste', router)

//set up the Express server to listen on port 3000 and logs some messages when the server is ready
let server = app.listen(3000, function(){
  console.log("App server is running on port 3000");
});