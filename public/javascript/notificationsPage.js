$(document).ready(function() {
    $.get('/api/notifications', function(data) {
        outputNotificationList(data);
    })
});

$(document).on('click', '.notification.active', function(event) {
    event.preventDefault();
    const container = event.target;
    const notificationId = container.dataset.id;
    const href = container.getAttribute('href');
    const callback = () => window.location = href;
    markNotificationsAsOpened(notificationId, callback);
})


$(document).on('click', '.mark-all-as-read', function(event) {
    markNotificationsAsOpened();
})


function outputNotificationList(notifications) {
    notifications.forEach(function(notification) {
        const html = createNotificationHTML(notification);
        document.querySelector('.notifications-page-container').insertAdjacentHTML('beforeend', html);
    })
}


function createNotificationHTML(notification) {
    const userFrom = notification.userFrom;
    const notificationText = getNotificationText(notification);
    const notificationUrl = getNotificationUrl(notification);
    const className = notification.opened? '' : 'active'
    return `
    <a href="${notificationUrl}" class="chat-item notification ${className}" data-id="${notification._id}">
        <div class="results-image-container">
            <img src="${userFrom.profilePic}">
        </div>
        <div class="chat-item-details-container ellipsis">
            ${notificationText}
        </div>
    </a>
    `
}

function getNotificationText(notification) {
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