let timer;
const selectedUsers = [];

// Adding event listener to the input
document.getElementById('userSearchTextbox').addEventListener('keydown', function(event) {
    clearTimeout(timer);
    const textBox = event.target;
    const value = textBox.value.trim();
    if(value == '' && event.key === 'Backspace') {
        selectedUsers.pop();
        updateSelectedUsersHTML();
        document.querySelector('.result-container').innerHTML = '';
        if(selectedUsers.length === 0) {
            document.getElementById('createChatButton').setAttribute('disabled', true);
        }
        return;
    }
    timer = setTimeout(function() {
        if(value == '') {
            document.querySelector('.result-container').innerHTMl = '';
        }
        else {
            searchUsers(value);
        }
    }, 1000)
})


// Adding Event Listener to createChat Button
document.getElementById('createChatButton').addEventListener('click', function () {
    const data = JSON.stringify(selectedUsers);
    $.post('/api/chats', {users: data}, function(chat) {
        if(!chat) {
            return console.log('Invalid response form the server');
        }
        window.location.href = `/messages/${chat._id}`;
    });
});


function searchUsers(value) {
    const url = `/api/users/search/${value}`;
    $.get(url, function(results) {
        outputSelectableUsers(results);
    });
}


// To display sleectable users from the search
function outputSelectableUsers(users) {
    document.querySelector('.result-container').innerHTML = '';
    users.forEach(function(user) {
        if(user._id === JSON.parse(userLoggedIn)._id || selectedUsers.some(function(object) {
            return (object._id === user._id);
        })) {
            return;
        }
        const html = createUserHTML(user, false);
        const element = new DOMParser().parseFromString(html, 'text/html').querySelector('.user');
        element.addEventListener('click', function() {
            userSelected(user);
        });
        document.querySelector('.result-container').insertAdjacentElement('afterbegin', element);
    });
}


// Helper function when the user is selected
function userSelected(user) {
    selectedUsers.push(user);
    updateSelectedUsersHTML();
    document.getElementById('userSearchTextbox').value = '';
    document.getElementById('userSearchTextbox').focus();
    document.querySelector('.result-container').innerHTML = '';
    document.getElementById('createChatButton').removeAttribute('disabled');
}

function updateSelectedUsersHTML() {
    const elements = [];
    selectedUsers.forEach(function(user) {
        const userName = `${user.firstName} ${user.lastName}`;
        const userElement = $(`<span class="selected-user">${userName}</span>`);
        elements.push(userElement);
    })
    $('.selected-user').remove();
    $('#selectedUsers').prepend(elements);
}