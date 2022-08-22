// Middle Ware for Login
exports.isLoggedIn = function(req, res, next) {
    if(req.session?.user) {
        return next();
    }
    else {
        return res.redirect('/login');
    }
}