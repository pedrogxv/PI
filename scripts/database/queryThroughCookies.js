const dbQuery = require('./get-query.js')
const apikey = process.env['apikey']

let queryThroughCookies = async (req, res, callback) => {

	await dbQuery(`"accessKey":"${req.cookies.accessKey}","email":"${req.cookies.email}"`, apikey, (returned) => {
	
		callback(returned)
		
	});

}

module.exports = queryThroughCookies