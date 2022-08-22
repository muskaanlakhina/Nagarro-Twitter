// ********** Importing Modules **********
const express = require('express');
const path = require('path');


// ********** Using Modules **********
const router = express.Router();


// ********** Get Request: /uploads/images/_path_ **********
router.get('/images/:path', function(req, res) {
    res.sendFile(path.join(__dirname, `../uploads/images/${req.params.path}`))
});


module.exports = router;