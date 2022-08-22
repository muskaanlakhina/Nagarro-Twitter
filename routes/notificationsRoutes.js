// ********** Importing Modules **********
const express = require('express');



// ********** Using Modules **********
const router = express.Router();



// ********** Get Request: /messages/ **********
router.get('/', function(req, res) {
    const payload = {
        pageTitle: 'Notifications',
        userLoggedIn: req.session.user,
        notifications: 'active'
    };
    res.status(200).render('notificationsPage', payload);
});

module.exports = router;