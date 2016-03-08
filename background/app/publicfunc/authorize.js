//=====================================
//function:   authorize for login
//=====================================

//用来验证是否登陆了

function authorize(req, res, nest) {
	if (!req.session.login_id) {
		res.redirect('/patient/login');
	} else {
		next();
	}
}

module.exports = authorize;