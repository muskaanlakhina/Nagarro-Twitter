// ********** Importing Modules **********
const express = require('express');
const mongoose = require('mongoose');
const User = require('../schema/userSchema');
const Chat = require('../schema/chatSchema');



// ********** Using Modules **********
const router = express.Router();


// ********** Get Request: /messages/ **********
router.get('/', function(req, res) {
    const payload = {
        pageTitle: 'Inbox',
        userLoggedIn: req.session.user,
        messages: 'active'
    };
    res.status(200).render('inboxPage', payload);
});

// ********** Get Request: /messages/ **********
router.get('/new', function(req, res) {
    const payload = {
        pageTitle: 'New Message',
        userLoggedIn: req.session.user,
        messages: 'active'
    };
    res.status(200).render('newMessage', payload);
});


// ********** Get Request: /messages/_chatId_ **********
router.get('/:chatId', async function(req, res) {
    const userId = req.session.user._id;
    const chatId = req.params.chatId;
    const isValidId = mongoose.isValidObjectId(chatId);
    const payload = {
        pageTitle: 'Chat',
        userLoggedIn: req.session.user,
        messages: 'active'
    };
    if(!isValidId) {
        payload.errorMessage = 'Chat does not exist';
        res.status(200).render('chatPage', payload);
    }
    let chat = await Chat.findOne({_id: chatId, users: {$elemMatch: {$eq: userId}}})
    .populate('users');
    if(chat === null) {
        const userFound = await User.findById(chatId);
        if(userFound != null) {
            chat = await getChatByUserId(userId, chatId);
        }
    }
    if(chat === null) {
        payload.errorMessage = 'Chat does not exist or you do not have permssion to view the chat.';
    } else {
        payload.chat = chat;
    }
    res.status(200).render('chatPage', payload);
});


function getChatByUserId(userLoggedInId, otherUserId) {
    return Chat.findOneAndUpdate({
        isGroupChat: false,
        users: {
            $size: 2,
            $all: [
                { $elemMatch: { $eq: mongoose.Types.ObjectId(userLoggedInId) }},
                { $elemMatch: { $eq: mongoose.Types.ObjectId(otherUserId) }}
            ]
        }
    }, {
        $setOnInsert: {
            users: [otherUserId, userLoggedInId]
        }
    }, {
        upsert: true,
        new: true
    }).populate('users');
}


module.exports = router;