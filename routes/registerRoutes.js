const express = require('express');
const User = require('../schema/userSchema');
const bcrypt = require('bcrypt');


// ********** Using Modules **********
const router = express.Router();


// ********** Get Request: /register/ **********
router.get('/', function(req, res) {
    res.render('register');
});


// ********** Post Request: /register/ **********
router.post('/', async function(req, res) {
    const firstName = req.body.firstName?.trim();
    const lastName = req.body.lastName?.trim();
    const username = req.body.username?.trim();
    const email = req.body.email?.trim();
    const password = req.body.password;
    const payload = req.body;

    if(firstName && lastName && username && email && password) {
        const user = await User.findOne({
            $or: [
                {username: username},
                {email: email}
            ]
        }).catch(function(err) {
            console.log(err);
            payload.errorMessage = 'Something went wrong. Try again later.';
            res.render('register', payload);
        });
        if(!user) {
            const newUser = new User(req.body);
            newUser.password = await bcrypt.hash(password, 10);
            newUser.save(function(err) {
                if(err) {
                    console.log('Database user insertion failed.');
                    res.render('register');
                }
                else{
                    res.render('login', {successMessage: 'Registered Succesfully'});
                }
            });
        }
        else {
            if(email == user.email) payload.errorMessage = 'Email already in use';
            else payload.errorMessage = 'Username already exists, try a different username';
            res.render('register', payload);
        }
    }
    else {
        payload.errorMessage = 'Make sure each field has a valid value.';
        res.render('register', payload);
    }
});


module.exports = router;