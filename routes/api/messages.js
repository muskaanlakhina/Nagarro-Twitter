// ********** Importing Modules **********
const express = require('express');
const Message = require('../../schema/messageSchema');
const User = require('../../schema/userSchema');
const Chat = require('../../schema/chatSchema');
const Notification = require('../../schema/notificationSchema')


// ********** Using Modules **********
const router = express.Router();


// ********** Post Request: /api/messages/ **********
router.post('/', function(req, res) {
    if(!req.body.content || !req.body.chatId) {
        console.log('Invalid data passed into request');
        return res.sendStatus(400);
    }
    const newMessage = new Message({
        sender: req.session.user._id,
        content: req.body.content,
        chat: req.body.chatId,
        readBy: [req.session.user._id]
    });
    newMessage.save()
    .then(async function(newMessage) {
        newMessage = await newMessage.populate('sender').execPopulate();
        newMessage = await newMessage.populate('chat').execPopulate();
        newMessage = await User.populate(newMessage, {path: 'chat.users'});
        const chat = await Chat.findByIdAndUpdate(req.body.chatId, {latestMessage: newMessage._id}, {new: true});
        insertNotifications(chat, newMessage);
        res.status(201).send(newMessage);
    })
    .catch(function(err) {
        console.log(err);
        res.sendStatus(400);
    });
});

function insertNotifications(chat, message) {
    chat.users.forEach(function(userId) {
        if(userId == String(message.sender._id)) return;
        Notification.insertNotification(userId, message.sender._id, 'newMessage', message.chat._id);
    });
}

module.exports = router;