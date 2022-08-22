let cropper;

// Adding event listener to follow button
$(document).on('click', '.follow-btn', function(event) {
    event.preventDefault();
    followBtnHandler(event, true);
})


// Getting the posts (By default)
function loadPosts() {
    $.get(`/api/posts/${profileUserId}/posts`, function(posts) {
        document.querySelector('.post-container').innerHTML = "";
        outputPosts(posts);
    });
}

function loadPinnedPost() {
    $.get(`/api/posts/${profileUserId}/pinnedPost`, function(post) {
        if(!post) {
            return;
        }
        document.querySelector('.pinned-post-container').innerHTML = "";
        document.querySelector('.pinned-post-container').innerHTML = createPost(post);
    });
}

// Adding event listener to replies tab
document.getElementById('tabReplies').addEventListener('click', function() {
    document.getElementById('tabReplies').classList.add('active-tab');
    document.getElementById('tabPosts').classList.remove('active-tab');
    loadReplies();
})


// Adding event listener to posts tab
document.getElementById('tabPosts').addEventListener('click', function() {
    document.getElementById('tabReplies').classList.remove('active-tab');
    document.getElementById('tabPosts').classList.add('active-tab');
    loadPosts();
})


// Getting the replies
function loadReplies() {
    $.get(`/api/posts/${profileUserId}/replies`, function(posts) {
        document.querySelector('.post-container').innerHTML = "";
        outputPosts(posts);
    });
}


// Outputing the posts
function outputPosts(posts) {
    posts.forEach(function(post) {
        const html = createPost(post);
        if(!post.pinned) {
            document.querySelector('.post-container').insertAdjacentHTML('afterbegin', html);
        }
    });
}


// Display Posts
function displayPosts() {
    const tab = document.querySelector('.active-tab').id;
    if(tab === 'tabPosts') {
        loadPosts();
    } else {
        loadReplies();
    }
}


// Modals Opening
function openPicModal(modalName) {
    document.querySelector('.backdrop').classList.add('modal-show');
    document.getElementById(`${modalName}Modal`).classList.add('modal-show');
}


// Modals Closing
function closePicModal(modalName) {
    document.getElementById(`${modalName}Modal`).classList.add('slide-up');
    setTimeout(function() {
        document.querySelector('.backdrop').classList.remove('modal-show');
        document.getElementById(`${modalName}Modal`).classList.remove('modal-show');
        document.getElementById(`${modalName}Modal`).classList.remove('slide-up');
    }, 150);
}


// Change Profile Pic
document.querySelector('.change-profile-pic')?.addEventListener('click', function() {
    openPicModal('profilePic')
})


// Profile Pic to blob
$('#profilePhoto').change(function() {
    if(this.files && this.files[0]) {
        const image = document.getElementById('profilePhotoPreview')
        const reader = new FileReader();
        reader.onload = function(e) {
            image.setAttribute('src', e.target.result);
            if(cropper !== undefined) {
                cropper.destroy();
            }
            cropper = new Cropper(image, {
                aspectRatio: 1 / 1,
                background: false,
            });
        }
        reader.readAsDataURL(this.files[0]);
    }
});


// Handling uploading of Profile Picture
$('#profilePicUploadButton').click(function() {
    const canvas = cropper.getCroppedCanvas();
    if(canvas == null) {
        console.log('Could not upload image. Make sure it is a valid image file');
        return;
    }
    canvas.toBlob(function(blob) {
        
        const formData = new FormData();
        formData.append('croppedImage', blob);
        $.ajax({
            url: '/api/users/profilePicture',
            type: 'POST',
            data: formData,
            // For not converting the transferring data to string
            processData: false,
            // For forcing not to add header
            contentType: false,
            success: function() {
                location.reload();
            }
        });
    });
});


// Closing Profile Pic Modal
document.getElementById('profilePicCloseModal')?.addEventListener('click', function() {
    closePicModal('profilePic');
})


// Change Cover Photo
document.querySelector('.change-cover-pic')?.addEventListener('click', function() {
    openPicModal('coverPhoto');
})


// Cover Pic to blob
$('#coverPhoto').change(function() {
    if(this.files && this.files[0]) {
        const image = document.getElementById('coverPhotoPreview')
        const reader = new FileReader();
        reader.onload = function(e) {
            image.setAttribute('src', e.target.result);
            if(cropper !== undefined) {
                cropper.destroy();
            }
            cropper = new Cropper(image, {
                aspectRatio: 16 / 9,
                background: false,
            });
        }
        reader.readAsDataURL(this.files[0]);
    }
});


// Handling uploading of Cover Photo
$('#coverPhotoUploadButton').click(function() {
    const canvas = cropper.getCroppedCanvas();
    if(canvas == null) {
        console.log('Could not upload image. Make sure it is a valid image file');
        return;
    }
    canvas.toBlob(function(blob) {
        const formData = new FormData();
        formData.append('croppedImage', blob);
        $.ajax({
            url: '/api/users/coverPhoto',
            type: 'POST',
            data: formData,
            // For not converting the transferring data to string
            processData: false,
            // For forcing not to add header
            contentType: false,
            success: function() {
                location.reload();
            }
        });
    });
});


// Closing Cover Photo Modal
document.getElementById('coverPhotoCloseModal')?.addEventListener('click', function() {
    closePicModal('coverPhoto');
})


loadPosts();
loadPinnedPost();