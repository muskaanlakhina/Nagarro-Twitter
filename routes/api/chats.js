// ********** Importing Modules **********
const express = require('express');
const Chat = require('../../schema/chatSchema');
const User = require('../../schema/userSchema');
const Message = require('../../schema/messageSchema');


// ********** Using Modules **********
const router = express.Router();

// ********** Get Request: /api/chats/_chatId_ *********
router.get('/:chatId', function(req, res) {
    Chat.findOne({_id: req.params.chatId, users: {$elemMatch: {$eq: req.session.user._id}}})
    .populate('users')
    .then(function(chat) {
        res.status(200).send(chat);
    }).catch(function() {
        res.sendStatus(400);
    })
})


// ********** Get Request: /api/chats/_chatId_/messages *********
router.get('/:chatId/messages', function(req, res) {
    Message.find({chat: req.params.chatId})
    .populate('sender')
    .then(function(message) {
        res.status(200).send(message);
    }).catch(function() {
        res.sendStatus(400);
    })
})


// ********** Post Request: /api/posts/ **********
router.get('/', function(req, res) {
    Chat.find({users: {$elemMatch: {$eq: req.session.user._id}}})
    .populate('users')
    .populate('latestMessage')
    .sort({'updatedAt': 1})
    .then(async function(chats) {
        if(req.query.unreadOnly !== undefined && req.query.unreadOnly == 'true') {
            chats = chats.filter(function(chat) {
                return (chat.latestMessage && !chat.latestMessage.readBy.includes(req.session.user._id));
            });
        }
        chats = await User.populate(chats, {path: 'latestMessage.sender'})
        res.status(200).send(chats);
    }).catch(function() {
        res.sendStatus(400);
    })
});


// ********** Post Request: /api/posts/ **********
router.post('/', function(req, res) {
    if(!req.body.users) {
        console.log('Users params not sent with the request');
        return res.sendStatus(400);
    }
    const users = JSON.parse(req.body.users);
    if(users.length === 0) {
        console.log('User array empty');
        return res.sendStatus(400);
    }
    users.push(req.session.user);
    const chatData = new Chat({
        users: users,
        isGroupChat: true
    });
    chatData.save().then(function(chat) {
        res.status(200).send(chat)
    }).catch(function(err) {
        console.log(err);
        res.sendStatus(400);
    });
});


// ********** Patch Request: /api/chats/_chatId_ **********
router.patch('/:chatId', function(req, res) {
    Chat.findByIdAndUpdate(req.params.chatId, {chatName: req.body.chatName})
    .then(function() {
        res.sendStatus(204);
    })
    .catch(function(err) {
        console.log(err);
        res.sendStatus(400);
    });
});

router.patch('/:chatId/messages/markAsRead', function(req, res) {
    Message.updateMany({chat: req.params.chatId}, {$addToSet: {readBy: req.session.user._id}})
    .then(function() {
        res.sendStatus(204);
    }).catch(function() {
        res.sendStatus(400);
    });
});

module.exports = router;