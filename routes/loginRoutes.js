// ********** Importing Modules **********
const express = require('express');
const User = require('../schema/userSchema');
const bcrypt = require('bcrypt');


// ********** Using Modules **********
const router = express.Router();

// ********** Get Request: /login/ **********
router.get('/', function(req, res) {
    res.render('login');
});

// ********** Post Request: /login/ **********
router.post('/', async function(req, res) {
    const payload = req.body;
    if(req.body.loginUsername.trim() && req.body.loginPassword) {
        const foundUser = await User.findOne({
            $or: [
                {username: req.body.loginUsername},
                {email: req.body.loginUsername}
            ]
        }).catch(function(err) {
            console.log(err);
            payload.errorMessage = 'Something went wrong. Try again later.';
            res.render('login', payload);
        });
        if(foundUser) {
            const result = await bcrypt.compare(req.body.loginPassword, foundUser.password); 
            if(result) { 
                req.session.user = foundUser;
                return res.redirect('/');
            }
        }
        payload.errorMessage = 'Incorrect Login Credentials';
        res.render('login', payload);
    }
    else {
        payload.errorMessage = 'Make sure each field has a valid value';
        res.render('login', payload);
    }
});


module.exports = router;