// ********** Importing Modules **********
const express = require('express');
const Notification = require('../../schema/notificationSchema');


// ********** Using Modules **********
const router = express.Router();


// ********** Post Request: /api/messages/ **********
router.get('/', function(req, res) {
    const searchObj = {
        userTo: req.session.user._id,
        notificationType: {
            $ne: 'newMessage'
        }
    }
    if(req.query.unreadOnly == 'true') {
        searchObj.opened = false;
    }
    Notification.find(searchObj)
    .populate('userTo')
    .populate('userFrom')
    .sort({createdAt: -1})
    .then(function(results) {
        res.status(200).send(results);
    })
    .catch(function(err) {
        console.log(err);
        res.sendStatus(400);
    });
});

router.get('/latest', function(req, res) {
    Notification.findOne({userTo: req.session.user._id})
    .populate('userTo')
    .populate('userFrom')
    .sort({createdAt: -1})
    .then(function(results) {
        res.status(200).send(results);
    })
    .catch(function(err) {
        console.log(err);
        res.sendStatus(400);
    });
});

// ********** Patch Request: /api/messages/ **********
router.patch('/:id/markAsOpened', function(req, res) {
    Notification.findByIdAndUpdate(req.params.id, {opened: true})
    .then(function() {
        res.sendStatus(204);
    })
    .catch(function(err) {
        console.log(err);
        res.sendStatus(400);
    });
});

// ********** Patch Request: /api/messages/ **********
router.patch('/markAsOpened', function(req, res) {
    Notification.updateMany({userTo: req.session.user._id}, {opened: true})
    .then(function() {
        res.sendStatus(204);
    })
    .catch(function(err) {
        console.log(err);
        res.sendStatus(400);
    });
});

module.exports = router;