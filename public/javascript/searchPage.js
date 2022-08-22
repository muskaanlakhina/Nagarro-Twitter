let timer;

// Adding event listener to the input
document.getElementById('searchBox').addEventListener('keyup', function(event) {
    clearTimeout(timer);
    const textBox = event.target;
    const searchType = textBox.dataset.search;
    const value = textBox.value.trim();

    timer = setTimeout(function() {
        if(value == '') {
            document.querySelector('.result-container').innerHTML = '';
        }
        else {
            search(value, searchType);
        }
    }, 1000)
})


function search(value, searchType) {
    const url = (searchType==='users')? `/api/users/search/${value}` : `/api/posts/search/${value}`;
    $.get(url, function(results) {
        if(searchType === 'posts') {
            outputPosts(results);
        }
        else {
            outputUsers(results);
        }
    });
}


// Outputing the posts
function outputPosts(posts) {
    document.querySelector('.result-container').innerHTML = '';
    posts.forEach(function(post) {
        const html = createPost(post);
        document.querySelector('.result-container').insertAdjacentHTML('afterbegin', html);
    });
}


// Outputing the Followers
function outputUsers(users) {
    document.querySelector('.result-container').innerHTML = '';
    users.forEach(function(user) {
        document.querySelector('.result-container').insertAdjacentHTML('afterbegin', createUserHTML(user));
    });
}


$(document).on('click', '.follow-btn', function(event) {
    event.preventDefault();
    followBtnHandler(event, false);
})


// Display Posts
function displayPosts() {}