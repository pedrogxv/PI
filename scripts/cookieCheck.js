const cookieCheck = (req, res, callback) => {

	if (req.cookies.senha && req.cookies.email) {

		res.redirect("/user-home")

	} else {

		callback()

	}

}

module.exports = cookieCheck