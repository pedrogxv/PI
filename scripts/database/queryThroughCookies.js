const dbQuery = require('./get-query.js')
const apikey = process.env['apikey']

let queryThroughCookies = async (req, res) => {

	return await dbQuery(`"accessKey":"${req.cookies.accessKey}","email":"${req.cookies.email}"`, apikey)
	
}

module.exports = queryThroughCookies