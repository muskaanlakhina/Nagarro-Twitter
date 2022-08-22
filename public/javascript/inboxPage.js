$(document).ready(function() {
    $.get('/api/chats', function(chats) {
        outputChats(chats);
    });
});

function outputChats(chats) {
    chats.forEach(function(chat) {
        const html = createChatHTML(chat);
        document.querySelector('.inbox-result-container').insertAdjacentHTML('afterbegin', html);
    });
}

function createChatHTML(chat) {
    const chatName = getChatName(chat);
    const img = getChatImageElement(chat);
    const latestMessage = getLatestMessage(chat.latestMessage);
    const activeClass = (!chat.latestMessage || chat.latestMessage.readBy.includes(JSON.parse(userLoggedIn)._id))? '' : 'active';
    return `
    <a class="chat-item ${activeClass}" href="/messages/${chat._id}">
        ${img}
        <div class="chat-item-details-container ellipsis">
            <span class="heading ellipsis">${chatName}</span>
            <span class="subtext ellipsis">${latestMessage}</span>
        </div>
    </a>
    `
}

function getLatestMessage(latestMessage) {
    if(latestMessage) {
        const sender = latestMessage.sender;
        return `${sender.firstName} ${sender.lastName}: ${latestMessage.content}`
    }
    return 'New Chat'
}


function getChatName(chat) {
    const chatName = chat.chatName;
    if(!chatName) {
        const otherChatUsers = getOtherChatUsers(chat.users);
        const namesArray = otherChatUsers.map(user => `${user.firstName} ${user.lastName}`);
        return namesArray.join(', ');
    } else {
        return chatName;
    }
}

function getOtherChatUsers(users) {
    if(users.length === 1) {
        return users;
    }
    return users.filter(function(user) {
        return (user._id != JSON.parse(userLoggedIn)._id);
    });
}


function getChatImageElement(chat) {
    const otherUsers = getOtherChatUsers(chat.users);
    let groupChatClass = '';
    let chatImage = getUserChatImageElement(otherUsers[0]);
    if(otherUsers.length > 1) {
        groupChatClass = 'group-chat-img';
        chatImage += getUserChatImageElement(otherUsers[1]);
    }
    return `<div class="results-image-container ${groupChatClass}">${chatImage}</div> `
}


function getUserChatImageElement(user) {
    if(!user || !user.profilePic) {
        return console.log('User passed into function is invalid');
    }
    return `<img src="${user.profilePic}" alt="User's Profile Picture">`;
}