function outputPosts(posts, mainPost) {
    posts.forEach(function(post) {
        let html = '';
        if(mainPost) {
            html = createPost(post, 'main-post');
        }
        else {
            html = createPost(post);
        }
        document.querySelector('.post-container').insertAdjacentHTML('afterbegin', html);
    });
}


// For displaying the posts
function displayPosts() {
    $.get(`/api/posts/${postId}`, function(result) {
        document.querySelector('.post-container').innerHTML = "";
        outputPosts(result.replies);
        outputPosts(result.postData, 'main-post');
        if(result.replyTo) outputPosts([result.replyTo]);
    });
}

displayPosts();