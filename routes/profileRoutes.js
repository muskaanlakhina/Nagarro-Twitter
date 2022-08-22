// ********** Importing Modules **********
const express = require('express');
const User = require('../schema/userSchema');


// ********** Using Modules **********
const router = express.Router();


// ********** Get Request: /profile/ **********
router.get('/', function(req, res) {
    const payload = {
        pageTitle: `${req.session.user.firstName} ${req.session.user.lastName}`,
        userLoggedIn: req.session.user,
        profileUser: req.session.user,
        profile: 'active'
    }
    res.render('profilePage', payload);
});


// ********** Get Request: /profile/_usernameOrId_ **********
router.get('/:username', async function(req, res) {
    const profileUser = await User.findOne({username: req.params.username})
    .catch(function(err) {
        console.log(err);
        res.sendStatus(400);
    })
    let payload = {};
    if(!profileUser) {
        const profileUserById = await User.findById(req.params.username)
        .catch(function(err) {
            console.log(err);
        })
        if(!profileUserById){
            payload = {
                pageTitle: 'User not found',
                userLoggedIn: req.session.user,
                profile: 'active'
            }
        }
        else {
            payload = {
                pageTitle: `${profileUserById.firstName} ${profileUserById.lastName}`,
                userLoggedIn: req.session.user,
                profileUser: profileUserById,
                profile: 'active'
            }
        }
    }
    else {
        payload = {
            pageTitle: `${profileUser.firstName} ${profileUser.lastName}`,
            userLoggedIn: req.session.user,
            profileUser: profileUser,
            profile: 'active'
        }
    }
    res.render('profilePage', payload);
})


// ********** Get Request: /profile/_username_/followers **********
router.get('/:username/followers', async function(req, res) {
    const profileUser =  await User.findOne({username: req.params.username}).catch(function() {
        res.sendStatus(400);
    }),
    payload = {
        pageTitle: `${profileUser.firstName} ${profileUser.lastName}`,
        profileUser: profileUser,
        userLoggedIn: req.session.user,
        selectedTab: 'followers',
        profile: 'active'
    }
    res.render('followersPage', payload);
});


// ********** Get Request: /profile/_username_/following **********
router.get('/:username/following', async function(req, res) {
    const profileUser =  await User.findOne({username: req.params.username}).catch(function() {
        res.sendStatus(400);
    }),
    payload = {
        pageTitle: `${profileUser.firstName} ${profileUser.lastName}`,
        profileUser: profileUser,
        userLoggedIn: req.session.user,
        selectedTab: 'following',
        profile: 'active'
    }
    res.render('followersPage', payload);
})


module.exports = router;