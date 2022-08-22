$(document).ready(function() {
    refreshMessagesBadge();
    refreshNotificationsBadge();
});

function messageReceived(newMessage) {
    refreshMessagesBadge();
    if($(`[data-room='${newMessage.chat._id}']`).length == 0) {
        showMessagePopup(newMessage);
    }
    else {
        markAllMessagesAsRead(newMessage.chat._id);
        addChatMessageHTML(newMessage);
        scrollToBottom(true);
    }
}

function showMessagePopup(message) {
    if(!message.chat.latestMessage || !message.chat.latestMessage._id) {
        message.chat.latestMessage = message;
    }
    const html = createChatHTML(message.chat);
    const element = $(html);
    element.hide().prependTo('.notificationsList').slideDown('fast');
    setTimeout(function() {
        element.fadeOut();
    }, 5000);
}

function createChatHTML(chat) {
    const chatName = getChatNamePopup(chat);
    const img = getChatImageElementPopup(chat);
    const latestMessage = getLatestMessagePopup(chat.latestMessage);
    return `
    <a class="chat-item popup" href="/messages/${chat._id}">
        ${img}
        <div class="chat-item-details-container ellipsis">
            <span class="heading ellipsis">${chatName}</span>
            <span class="subtext ellipsis">${latestMessage}</span>
        </div>
    </a>
    `
}

function getLatestMessagePopup(latestMessage) {
    if(latestMessage) {
        const sender = latestMessage.sender;
        return `${sender.firstName} ${sender.lastName}: ${latestMessage.content}`
    }
    return 'New Chat'
}


function getChatNamePopup(chat) {
    const chatName = chat.chatName;
    if(!chatName) {
        const otherChatUsers = getOtherChatUsersPopup(chat.users);
        const namesArray = otherChatUsers.map(user => `${user.firstName} ${user.lastName}`);
        return namesArray.join(', ');
    } else {
        return chatName;
    }
}

function getOtherChatUsersPopup(users) {
    if(users.length === 1) {
        return users;
    }
    return users.filter(function(user) {
        return (user._id != JSON.parse(userLoggedIn)._id);
    });
}


function getChatImageElementPopup(chat) {
    const otherUsers = getOtherChatUsersPopup(chat.users);
    let groupChatClass = '';
    let chatImage = getUserChatImageElementPopup(otherUsers[0]);
    if(otherUsers.length > 1) {
        groupChatClass = 'group-chat-img';
        chatImage += getUserChatImageElementPopup(otherUsers[1]);
    }
    return `<div class="results-image-container ${groupChatClass}">${chatImage}</div> `
}


function getUserChatImageElementPopup(user) {
    if(!user || !user.profilePic) {
        return console.log('User passed into function is invalid');
    }
    return `<img src="${user.profilePic}" alt="User's Profile Picture">`;
}

function refreshMessagesBadge() {
    $.get('/api/chats', {unreadOnly: true}, function(data) {
        const numResults = data.length;
        if(numResults > 0) {
            $('#messagesBadge').text(numResults).addClass('active');
        } else {
            $('#messagesBadge').text('').removeClass('active');
        }
    }) 
}

function refreshNotificationsBadge() {
    $.get('/api/notifications', {unreadOnly: true}, function(data) {
        const numResults = data.length;
        if(numResults > 0) {
            $('#notificationsBadge').text(numResults).addClass('active');
        } else {
            $('#notificationsBadge').text('').removeClass('active');
        }
    }) 
}

function showNotificationPopup(notification) {
    const html = createNotificationHTMLPopup(notification);
    const element = $(html);
    refreshNotificationsBadge();
    element.prependTo('.notificationsList').hide().slideDown('fast');
    setTimeout(function() {
        element.fadeOut();
    }, 5000);
}

$(document).on('click', '.notification.active', function(event) {
    event.preventDefault();
    const container = event.target;
    const notificationId = container.dataset.id;
    const href = container.getAttribute('href');
    const callback = () => window.location = href;
    markNotificationsAsOpened(notificationId, callback);
})

function createNotificationHTMLPopup(notification) {
    const userFrom = notification.userFrom;
    const notificationText = getNotificationTextPopup(notification);
    const notificationUrl = getNotificationUrl(notification);
    const className = notification.opened? '' : 'active'
    return `
    <a href="${notificationUrl}" class="chat-item notification ${className} popup" data-id="${notification._id}">
        <div class="results-image-container">
            <img src="${userFrom.profilePic}">
        </div>
        <div class="chat-item-details-container ellipsis">
            <span class="ellipsis">${notificationText}</span>
        </div>
    </a>
    `
}

function getNotificationTextPopup(notification) {
    const userFrom = notification.userFrom;
    if(!userFrom.firstName || !userFrom.lastName) {
        return console.log('Notifications data is not populated');
    }
    const userFromName = `${userFrom.firstName} ${userFrom.lastName}`;
    let text = '';
    if(notification.notificationType == 'retweet') {
        text = `${userFromName} retweeted your post`;
    }
    else if(notification.notificationType == 'postLike') {
        text = `${userFromName} liked your post`;
    }
    else if(notification.notificationType == 'reply') {
        text = `${userFromName} replied to your post`;
    }
    else if(notification.notificationType == 'follow') {
        text = `${userFromName} started following you`;
    }
    return `<span class="ellipsis">${text}</span>`;
}

function getNotificationUrl(notification) {
    let url = '';
    if(notification.notificationType == 'retweet' || notification.notificationType == 'postLike' || notification.notificationType == 'reply') {
        url = `/post/${notification.entityId}`;
    }
    else if(notification.notificationType == 'follow') {
        url = `/profile/${notification.entityId}`;
    }
    return url;
}

function markNotificationsAsOpened(notificationId = null, callback = null) {
    if(callback == null) callback = () => location.reload();
    const url = notificationId? `/api/notifications/${notificationId}/markAsOpened` : '/api/notifications/markAsOpened';
    $.ajax({
        url: url,
        type: 'PATCH',
        success: function() {
            callback();
        }
    })
}