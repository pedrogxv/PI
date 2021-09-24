const cookieCheck = (req, res, callback) => {

	if (req.cookies.senha && req.cookies.email) {

		res.redirect("/user-home")

	} else {

		// callback se refere ao que é pra fazer se NÃO houver cookies
		callback()

	}

}

module.exports = cookieCheck