function followBtnHandler(event, toReload) {
    const userId = event.target.dataset.id;
    $.ajax({
        url: `/api/users/${userId}/follow`,
        type: 'PATCH',
        success: function(data) {
            const followersNum = document.getElementById('followersNum');
            if(data.following?.includes(userId)) {
                event.target.classList.add('is-following');
                event.target.textContent = 'Following'
                event.target.classList.remove('to-follow');
                if (followersNum) followersNum.textContent = Number(followersNum.textContent) + 1;
                emitNotification(userId);
            }
            else {
                event.target.classList.add('to-follow');
                event.target.textContent = 'Follow'
                event.target.classList.remove('is-following');
                if (followersNum) followersNum.textContent = Number(followersNum.textContent) - 1;
            }
            if(toReload) {
                location.reload();
            }
        }
    });
}