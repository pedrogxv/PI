const cookieCheck = (req, res, callback) => {

	if (req.cookies.accessKey && req.cookies.email) {

		res.redirect("/user-home")

	} else {

		callback()

	}

}

module.exports = cookieCheck