// ********** Importing Modules **********
const express = require('express');;


// ********** Using Modules **********
const router = express.Router();


// ********** Get Request: /profile/ **********
router.get('/', function(req, res) {
    const payload = createPayload(req.session.user);
    res.status(200).render('searchPage', payload);
});


router.get('/:selectedTab', function(req, res) {
    const payload = createPayload(req.session.user);
    payload.selectedTab = req.params.selectedTab;
    res.status(200).render('searchPage', payload);
})


function createPayload(userLoggedIn) {
    return {
        pageTitle: `Search`,
        userLoggedIn: userLoggedIn,
        search: 'active'
    }
}


module.exports = router;