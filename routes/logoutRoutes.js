// ********** Importing Modules **********
const express = require('express');


// ********** Using Modules **********
const router = express.Router();


// ********** Get Request: /logout/ **********
router.get('/', function(req, res) {
    req.session.destroy(function() {
        res.redirect('/');
    });
});

module.exports = router;