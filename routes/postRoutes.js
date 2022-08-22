// ********** Importing Modules **********
const express = require('express');


// ********** Using Modules **********
const router = express.Router();


// ********** Get Request: /post/_id_ **********
router.get('/:id', function(req, res) {
    res.render('postPage', {
        pageTitle: 'View Post',
        postId: req.params.id,
        userLoggedIn: req.session.user,
        home: 'active'
    });
});

module.exports = router;