let typing = false;
let lastTypingTime;

$(document).ready(function() {
    socket.emit('join room', JSON.parse(chat)._id);
    socket.on('typing', function() {
        $('.typing-dots').show();
        scrollToBottom(true);
    });
    socket.on('stop typing', function() {
        $('.typing-dots').hide();
    });
    $.get(`/api/chats/${JSON.parse(chat)._id}`, function(resultChat) {
        document.getElementById('chatName').innerText = getChatName(resultChat);
        document.querySelector('.chat-titlebar-container').insertAdjacentHTML('afterbegin', getChatImageElement(JSON.parse(chat)));
    });
    $.get(`/api/chats/${JSON.parse(chat)._id}/messages`, function(messages) {
        let lastSenderId = '';
        messages.forEach(function(message, index) {
            addChatMessageHTML(message, messages[index+1], lastSenderId);
            lastSenderId = message.sender._id;
        });
        scrollToBottom(false);
        markAllMessagesAsRead(JSON.parse(chat)._id);
    });
});

// Chat Name Modal
function openModal(modalName) {
    document.querySelector('.backdrop').classList.add('modal-show');
    document.getElementById(`${modalName}Modal`).classList.add('modal-show');
    document.getElementById('chatNameSubmitButton').setAttribute('data-chatid', JSON.parse(chat)._id);
}

// Modals Closing
function closeModal(modalName) {
    document.getElementById(`${modalName}Modal`).classList.add('slide-up');
    setTimeout(function() {
        document.querySelector('.backdrop').classList.remove('modal-show');
        document.getElementById(`${modalName}Modal`).classList.remove('modal-show');
        document.getElementById(`${modalName}Modal`).classList.remove('slide-up');
    }, 150);
}

// Closing all the modals
document.querySelector('.backdrop').addEventListener('click', function() {
    document.querySelectorAll('.modal').forEach(function(modal) {
        document.querySelector('.backdrop').classList.remove('modal-show');
        modal.classList.remove('modal-show');
    })
})

// Changing the chat Name
$(document).on('click', '#chatName', function(event) {
    openModal('chatName');
});

// Handling the clicking of chat Name
const chatNameSubmitBtn = document.getElementById('chatNameSubmitButton')
chatNameSubmitBtn.addEventListener('click', function () {
    console.log(chatNameSubmitBtn.dataset);
    const chatId = chatNameSubmitBtn.dataset.chatid;
    const newName = document.getElementById('chatNameTextbox').value;
    console.log(newName);
    $.ajax({
        url: `/api/chats/${chatId}`,
        type: 'PATCH',
        data: {
            chatName: newName
        },
        success: function () {
            location.reload();
        }
    });
});

// Closing the change Name Modal
document.getElementById('chatNameCloseModal').addEventListener('click', function() {
    closeModal('chatName');
})


document.querySelector('.send-message-button').addEventListener('click', function() {
    submitMessage();
})


$('.messageInput').keydown(function(event){
    updateTyping();
    if(event.key == 'Enter' && !(event.shiftKey)) {
        submitMessage();
        return false;
    }
});

function updateTyping() {
    if(!connected) {
        return;
    }
    if(!typing) {
        typing = true;
        socket.emit('typing', JSON.parse(chat)._id);
    }
    lastTypingTime = new Date().getTime();
    let timerLength = 2000;
    setTimeout(function() {
        const timeNow = new Date().getTime();
        const timeDiff = timeNow - lastTypingTime;
        if(timeDiff >= timerLength && typing) {
            socket.emit('stop typing', JSON.parse(chat)._id);
            typing = false;
        }
    }, timerLength);
}


function submitMessage() {
    const content = $('.messageInput').val().trim();
    if(content != '') {
        $('.messageInput').val('');
        sendMessage(content);
        socket.emit('stop typing', JSON.parse(chat)._id);
        typing = false;
    }
}


function sendMessage(message) {
    $.post('/api/messages', {content: message, chatId: JSON.parse(chat)._id}, function(data) {
        addChatMessageHTML(data);
        if(connected) {
            socket.emit('new message', data);
        }
        scrollToBottom(true);
    });
}


function addChatMessageHTML(message, nextMessage, lastSenderId) {
    if(!message || !message._id) {
        return console.log('Message is not valid');
    }
    let messageDiv = '';
    if(!nextMessage && !lastSenderId) {
        messageDiv = createMessageHTML(message, null, '');
    } else {
        messageDiv = createMessageHTML(message, nextMessage, lastSenderId);
    }
    document.querySelector('.typing-dots').insertAdjacentHTML('beforebegin', messageDiv);

}


function createMessageHTML(message, nextMessage, lastSenderId) {
    const sender = message.sender;
    const senderName = sender.firstName + " " + sender.lastName;
    const currentSenderId = sender._id;
    const nextSenderId = nextMessage? nextMessage.sender._id : '';
    const isFirst = lastSenderId != currentSenderId;
    const isLast = nextSenderId != currentSenderId;
    const isMine = String(message.sender._id) == String(JSON.parse(userLoggedIn)._id);
    let liClassName = isMine? 'mine' : 'theirs';
    let nameElement = '';
    let imageContainer = '';
    let profileImage = '';
    if(isFirst) {
        liClassName += ' first';
        if(!isMine) {
            nameElement = `<span class = "sender-name">${senderName}</span>`
        }
    }
    if(isLast) {
        liClassName += ' last';
        profileImage = `<img src="${sender.profilePic}">`
    }
    if(!isMine) {
        imageContainer = `
        <div class="image-container">
            ${profileImage}
        </div>`
    }
    return `
    ${nameElement}
    <li class="message ${liClassName}">
    ${imageContainer}
    <div class="message-container">
            <p class="message-body">${message.content}</p>
        </div>
    </li>
    `
}


const users = JSON.parse(chat).users;

function getChatImageElement(chat) {
    let groupChatClass = '';
    let chatImage = '';
    if(chat.isGroupChat) {
        chatImage = getUserChatImageElement(chat.users[0]);
        groupChatClass = 'chat-group-chat-img';
        if(chat.users.length > 3) {
            chatImage = `<span class="other-users-num">+ ${chat.users.length - 3}</span>` + chatImage;
        }
        for(let i = 1; i < chat.users.length; i++) {
            if(i >= 3) {
                break;
            }
            chatImage += getUserChatImageElement(chat.users[i]);
        }
    }
    else {
        otherUsers = getOtherChatUsers(users);
        chatImage = getUserChatImageElement(otherUsers[0]);
    }
    return `<div class="chat-results-image-container ${groupChatClass}">${chatImage}</div> `
}

function getOtherChatUsers(users) {
    if(users.length === 1) {
        return users;
    }
    return users.filter(function(user) {
        return (user._id != JSON.parse(userLoggedIn)._id);
    });
}

function getUserChatImageElement(user) {
    if(!user || !user.profilePic) {
        return console.log('User passed into function is invalid');
    }
    return `<img src="${user.profilePic}" alt="User's Profile Picture">`;
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


function scrollToBottom(animated) {
    const container = $('.chat-container');
    const scrollHeight = container[0].scrollHeight;
    if(animated) {
        container.animate({scrollTop: scrollHeight}, "slow");
    }
    else {
        container.scrollTop(scrollHeight);
    }
}

function markAllMessagesAsRead(chatId) {
    $.ajax({
        url: `/api/chats/${chatId}/messages/markAsRead`,
        type: 'PATCH',
        success: () => refreshMessagesBadge()
    })
}