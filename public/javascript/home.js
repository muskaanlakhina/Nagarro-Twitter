// ********** Handling Posting of a new tweet **********
// Enabling and disabling the post button
const postTextarea = document.getElementById('postTextarea');
postTextarea?.addEventListener('keyup', function (event) {
    const value = event.target.value.trim();
    if (!value) submitBtn.setAttribute('disabled', true);
    else submitBtn.removeAttribute('disabled');
});

// Clicking on the post button
const submitBtn = document.getElementById('submitPostButton');
submitBtn.addEventListener('click', function () {
    const data = {
        content: postTextarea.value
    };
    $.post('/api/posts', data, function (postData) {
        const html = createPost(postData);
        document.querySelector('.post-container').insertAdjacentHTML('afterbegin', html);
        postTextarea.value = "";
        submitBtn.setAttribute('disabled', true);
    });
});


// For displaying the posts
function displayPosts() {
    $.get('/api/posts', function(posts) {
        document.querySelector('.post-container').innerHTML = "";
        outputPosts(posts);
    });
}

// For displaying the posts
function outputPosts(posts) {
    posts.forEach(function(post) {
        const html = createPost(post);
        document.querySelector('.post-container').insertAdjacentHTML('afterbegin', html);
    });
}

$.get('/api/posts', function(posts) {
    document.querySelector('.post-container').innerHTML = "";
    outputPosts(posts);
});

displayPosts();