let connected = false;
const socket = io('http://localhost:3000');
socket.emit('setup', JSON.parse(userLoggedIn));
socket.on('connected', function() {
    connected = true;
});
socket.on('message received', function(newMessage) {
    messageReceived(newMessage);
})

socket.on('notification received', function() {
    $.get('/api/notifications/latest', function(notificationData) {
        showNotificationPopup(notificationData); 
    });
});

function emitNotification(userId) {
    if(userId == JSON.parse(userLoggedIn)._id) {
        return;
    }
    socket.emit('notification received', userId);
}