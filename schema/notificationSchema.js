const mongoose = require('mongoose');


const notificationSchema = new mongoose.Schema({
    userTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    userFrom: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    notificationType: String,
    opened: {
        type: Boolean,
        default: false
    },
    entityId: mongoose.Schema.Types.ObjectId,
}, {timestamps: true});

notificationSchema.statics.insertNotification = async function(userTo, userFrom, notificationType, entityId) {
    const data = {
        userTo: userTo,
        userFrom: userFrom,
        notificationType: notificationType,
        entityId: entityId
    }
    if(data.userTo == data.userFrom) {
        return;
    }
    await Notification.deleteOne(data).catch(err => console.log(err));
    Notification.create(data).then(function(result) {
        return result;
    }).catch(err => console.log(err));
}

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;