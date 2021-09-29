const dbQuery = require('./get-query.js')
const apikey = process.env['apikey']

let queryThroughCookies = async (req, res) => {

	return await dbQuery(`"senha":"${req.cookies.senha}","email":"${req.cookies.email}"`, apikey, req.cookies.userMode == "candidato" ? "https://pisample-250e.restdb.io/rest/userdata?" : "https://pisample-250e.restdb.io/rest/empresadata?")
	
}

module.exports = queryThroughCookies