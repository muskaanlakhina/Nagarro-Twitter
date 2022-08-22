// Modals Opening
function openModal(modalName, selectedPost, pinId=null) {
    document.querySelector('.backdrop').classList.add('modal-show');
    document.getElementById(`${modalName}SelectedPost`).innerHTML = '';
    document.getElementById(`${modalName}Modal`).classList.add('modal-show');
    document.getElementById(`${modalName}SelectedPost`).insertAdjacentHTML('afterbegin', selectedPost.outerHTML);
    if(!pinId) document.getElementById(`${modalName}SubmitButton`).setAttribute('data-id', selectedPost.dataset.id);
    else document.getElementById(`${modalName}SubmitButton`).setAttribute('data-id', pinId);
}

// Modals Closing
function closeModal(modalName) {
    document.getElementById(`${modalName}Modal`).classList.add('slide-up');
    setTimeout(function() {
        document.querySelector('.backdrop').classList.remove('modal-show');
        document.getElementById(`${modalName}Modal`).classList.remove('modal-show');
        document.getElementById(`${modalName}Modal`).classList.remove('slide-up');
    }, 150);
    document.getElementById(`${modalName}SelectedPost`).innerHTML = ''
}


// For creation of a single post
function createPost(postData, mainPost) {
    const mainPostClass = mainPost? 'big' : '';
    let userSpecificText = '';
    let pinnedClass = '';
    let pinnedPostText = '';
    if(postData.postedBy._id === JSON.parse(userLoggedIn)._id) {
        if(postData.pinned) {
            pinnedPostText = `<span class="pin-text grey">Pinned</span>`
            pinnedClass = 'pinned';
        }
        userSpecificText = `<span class="pin ${pinnedClass}">
            <i class="fas fa-thumbtack"></i>
        </span>
        <span class="delete">
            <i class="fas fa-trash"></i>
        </span>`;
    }
    const postId = postData._id;
    const isRetweet = postData.retweetData;
    let retweetText = '';
    if(isRetweet) {
        const retweetTime = timeDifference(new Date(), new Date(postData.createdAt));
        retweetText = `<div class="retweet-container"}>Retweeted by <a href="/profile/${postData.postedBy.username}">@${postData.postedBy.username}</a> • ${retweetTime}</div>`;
        postData = postData.retweetData;
    }
    const isReply = postData.replyTo;
    const replyText = isReply? `Replied to <a href="/profile/${postData.replyTo.postedBy?.username}"> @${postData.replyTo.postedBy?.username} </a>` : '';
    const time = timeDifference(new Date(), new Date(postData.createdAt));
    let retweetClass = postData.retweetUsers.includes(JSON.parse(userLoggedIn)._id)? 'active-retweet': '';
    const heartClass = postData.likes.includes(JSON.parse(userLoggedIn)._id)? 'fas' : 'far';
    return `
    <div data-id="${postData._id}" class="post ${mainPostClass}">
        <div class="user-specific">${userSpecificText}</div>
        <div class="pin-container" data-id="${postId}">${pinnedPostText}</div>
        ${retweetText}
        <div class="tweet-container">
            <div class="profile-pic-container">
                <img class="profile-pic" src="${postData.postedBy.profilePic}" alt="User's profile pic" class="profile-pic">
            </div>
            <div class="tweet">
                <a href="/profile/${postData.postedBy.username}">
                    <span class="name">${postData.postedBy.firstName} ${postData.postedBy.lastName}</span>
                    <span class="grey">@${postData.postedBy.username}</span>
                </a> • <span class="grey">${time}</span>
                <div class="reply-container">${replyText}</div>
                <p class="tweet-content">${postData.content}</p>
            </div>
        </div>
        <div class="footer">
            <button class="reply"><i class="far fa-comment"></i></button>
            <button class="retweet"><i class="fas fa-retweet ${retweetClass}"></i><span class="retweet-number">${postData.retweetUsers.length || ''}</span></button>
            <button class="heart"><i class="${heartClass} fa-heart"></i><span class="like-number">${postData.likes.length || ''}</span></button>
        </div>
    </div>`;
}

// Function to find out the elapsed time
function timeDifference(current, previous) {
    const msPerMinute = 60 * 1000;
    const msPerHour = msPerMinute * 60;
    const msPerDay = msPerHour * 24;
    const msPerMonth = msPerDay * 30;
    const msPerYear = msPerDay * 365;
    const elapsed = current - previous;
    if (elapsed < msPerMinute) {
        if(elapsed/1000 < 30) return 'Just Now';
         return Math.round(elapsed/1000) + ' seconds ago';   
    }
    else if (elapsed < msPerHour) return Math.round(elapsed/msPerMinute) + ' minutes ago';   
    else if (elapsed < msPerDay ) return Math.round(elapsed/msPerHour ) + ' hours ago';   
    else if (elapsed < msPerMonth) return Math.round(elapsed/msPerDay) + ' days ago';   
    else if (elapsed < msPerYear) return Math.round(elapsed/msPerMonth) + ' months ago';   
    else return Math.round(elapsed/msPerYear ) + ' years ago';
}

// Function to get id from the selected element
function getIdFromElement(element) {
    const res = element.closest('.post').dataset.id;
    if(!res) console.log('Post Id undefined');
    else return element.closest('.post').dataset.id;
}

// Like the post
$(document).on('click', '.heart', function(event) {
    const post = getIdFromElement(event.target);
    $.ajax({
        url: `/api/posts/${post}/like`,
        type: 'PATCH',
        success: function(postData) {
            event.target.querySelector('.like-number').textContent = postData.likes.length || '';
            if(postData.likes.includes(JSON.parse(userLoggedIn)._id)) {
                event.target.querySelector('.fa-heart').classList.add('fas');
                event.target.querySelector('.fa-heart').classList.remove('far');
                emitNotification(postData.postedBy);
            }
            else {
                event.target.querySelector('.fa-heart').classList.remove('fas');
                event.target.querySelector('.fa-heart').classList.add('far');
            }
            displayPosts();
        }
    });
});

// Retweet the post
$(document).on('click', '.retweet', function(event) {
    const post = getIdFromElement(event.target);
    $.ajax({
        url: `/api/posts/${post}/retweet`,
        type: 'POST',
        success: function(postData) {
            event.target.querySelector('.retweet-number').textContent = postData.retweetUsers.length || '';
            if(postData.retweetUsers.includes(JSON.parse(userLoggedIn)._id)) {
                event.target.querySelector('.fa-retweet').classList.add('active-retweet');
                emitNotification(postData.postedBy);
            }
            else {
                event.target.querySelector('.fa-retweet').classList.remove('active-retweet');
            }
            displayPosts();
        }
    });
});

// Closing all the modals
document.querySelector('.backdrop').addEventListener('click', function() {
    document.querySelectorAll('.modal').forEach(function(modal) {
        document.querySelector('.backdrop').classList.remove('modal-show');
        modal.classList.remove('modal-show');
    })
})

// Replying to the post
$(document).on('click', '.reply', function(event) {
    const selectedPost = event.target.closest('.post');
    openModal('reply', selectedPost);
});

// Enabling Disabling Reply Submit Button
const replyTextarea = document.getElementById('replyTextarea');
const replySubmitBtn = document.getElementById('replySubmitButton');
replyTextarea.addEventListener('keyup', function (event) {
    const value = event.target.value.trim();
    if (!value) replySubmitBtn.setAttribute('disabled', true);
    else replySubmitBtn.removeAttribute('disabled');
})

// Handling the clicking of reply button
replySubmitBtn.addEventListener('click', function() {
    const data = {
        content: replyTextarea.value,
        replyTo: replySubmitBtn.dataset.id
    };
    $.post('/api/posts', data, function(postData) {
        displayPosts();
        closeModal('reply');
        replyTextarea.value="";
        emitNotification(postData.replyTo.postedBy._id);
    });
})

// Closing reply Modal
document.getElementById('replyCloseModal').addEventListener('click', function() {
    closeModal('reply');
})

// Pinning the post
$(document).on('click', '.pin', function(event) {
    const selectedPost = event.target.closest('.post');
    const pinId = event.target.closest('.post').querySelector('.pin-container').dataset.id;
    console.log(pinId);
    if(event.target.closest('.pinned')) {
        if(pinId) {
            openModal('unpin', selectedPost, pinId);
        }
        else {
            openModal('unpin', selectedPost);
        }
    }
    else {
        if(pinId) {
            openModal('pin', selectedPost, pinId);
        }
        else {
            openModal('pin', selectedPost);
        }
    }
});


// Handling the clicking of pin button
const pinSubmitBtn = document.getElementById('pinSubmitButton');
pinSubmitBtn.addEventListener('click', function() {
    const data = {
        pinned: true
    };
    $.ajax({
        url: `/api/posts/${pinSubmitBtn.dataset.id}`,
        data: data,
        type: 'PATCH',
        success: function(){
            location.reload();
        }
    });
});


// Handling the clicking of unpin button
const unpinSubmitBtn = document.getElementById('unpinSubmitButton');
unpinSubmitBtn.addEventListener('click', function() {
    const data = {
        pinned: false
    };
    $.ajax({
        url: `/api/posts/${unpinSubmitBtn.dataset.id}`,
        data: data,
        type: 'PATCH',
        success: function(){
            location.reload();
        }
    });
})


// Closing the pin Modal
document.getElementById('pinCloseModal').addEventListener('click', function() {
    closeModal('pin');
})

// Closing the unpin Modal
document.getElementById('unpinCloseModal').addEventListener('click', function() {
    closeModal('unpin');
})

// Deleting the post
$(document).on('click', '.delete', function(event) {
    const selectedPost = event.target.closest('.post');
    openModal('delete', selectedPost);
});

// Handling the clicking of Delete button
const deleteSubmitBtn = document.getElementById('deleteSubmitButton')
deleteSubmitBtn.addEventListener('click', function (event) {
    const postId = deleteSubmitBtn.dataset.id;
    $.ajax({
        url: `/api/posts/${postId}`,
        type: 'DELETE',
        success: function () {
            location.reload();
        }
    })
});

// Closing the delete Modal
document.getElementById('deleteCloseModal').addEventListener('click', function() {
    closeModal('delete');
})

// Clicking on the post
$(document).on('click', '.post', function(event) {
    const postId = getIdFromElement(event.target);
    if(!event.target.closest('button') && !event.target.closest('a') && !event.target.closest('.delete') && !event.target.closest('.pin')) {
        window.location.href = `/post/${postId}`;
    }
});
