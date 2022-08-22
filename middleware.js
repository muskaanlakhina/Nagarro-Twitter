// requireLogin function
exports.requireLogin = (req, res, next) => {
    // Checks if session property is set and if the user property is set. 
    if (req.session && req.session.user){
        // If so then we use next
        return next()
    } else {
        // If user is not logged in we redirect them to login page.
        return res.redirect("/login")
    }
}