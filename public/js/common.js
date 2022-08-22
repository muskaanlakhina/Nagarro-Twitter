// Global variable.
var cropper

// Function to enable and disabled the POST button. 
$("#postTextarea, #replyTextarea").keyup(event => {
    var textbox = $(event.target)
    // Trim the value so the user is not able to print a post with only spaces.
    var value = textbox.val().trim()

    // This will be true or false wether we are in a modal or not.
    var isModal = textbox.parents(".modal").length == 1

    // Choses which btn to highlight depending on if we write in the home post container or
    // in the reply post container.
    var submitBtn = isModal ? $("#submitReplyButton") : $("#submitPostBtn")

    if(submitBtn.length == 0) return alert("No submit button found")

    if(value == ""){
        submitBtn.prop("disabled", true)
        return
    }
    submitBtn.prop("disabled", false)
})

$("#submitPostBtn, #submitReplyButton").click(() => {
    var button = $(event.target)

    var isModal = button.parents(".modal").length == 1
    var textbox = isModal ? $("#replyTextarea") : $("#postTextarea");

    var data = {
        content: textbox.val()
    }
    
    if (isModal) {
        var id = button.data().id;
        if(id == null) return alert("Button id is null");
        data.replyTo = id;
    }

    // Sending the data to the url and adding a callback function.
    $.post("/api/posts", data, postData => {

        if(postData.replyTo) {
            location.reload();
        } else {
            var html = createPostHtml(postData);
            $(".postsContainer").prepend(html);
            textbox.val("");
            button.prop("disabled", true);
        }
    })
})

// Checking if modal is open using a built in bootstrap event.
// Then adding the post we want to reply to inside. 
$("#replyModal").on("show.bs.modal", (event) => {
    var button = $(event.relatedTarget)
    var postId = getPostId(button)
    $("#submitReplyButton").data("id", postId)

    $.get(`/api/posts/${postId}`, results => {
        outputPosts(results.postData, $("#originalPostContainer") )
    })

})

// Removing the recently opened modals text, only shown with slow internet connection.
$("#replyModal").on("hidden.bs.modal", () => {
    $("#originalPostContainer").html("")
})

$("#filePhoto").change(function() {    
    // Making sure there is and array and that the first item is set.
    if(this.files && this.files[0]) {
        var reader = new FileReader()
        reader.onload = (e) => {
            var image = document.getElementById("imagePreview")
            image.src = e.target.result

            if(cropper !== undefined){
                // Built in js function which will destroy the variable.
                cropper.destroy()
            }

            cropper = new Cropper(image, {
                aspectRatio: 1 / 1,
                background: false
            })
        }
        reader.readAsDataURL(this.files[0])
    } else {
        console.log("nope")
    }
})

$("#imageUploadButton").click(() => {
    var canvas = cropper.getCroppedCanvas();

    if(canvas == null) {
        alert("Could not upload image. Make sure it is an image file.");
        return;
    }

    canvas.toBlob((blob) => {
        var formData = new FormData();
        formData.append("croppedImage", blob);

        $.ajax({
            url: "/api/users/profilePicture",
            type: "POST",
            data: formData,
            // Forces JQuery to not make this into a String (since it is an image). 
            processData: false,
            contentType: false,
            success: () => location.reload()
        })
    })
})

$(document).on("click", "#userUpdateButton", (event) => {
    const firstName = $("#firstName").val().trim()
    const lastName = $("#lastName").val().trim()
    const username = $("#username").val().trim()
    const email = $("#email").val().trim()
    
    $.ajax({
        url: `/api/users/${profileUserId}`,
        type: "PUT",
        data: {
            firstName,
            lastName,
            username,
            email
        },
        success: (data, status, xhr) => {
            if(xhr.status != 204) {
                alert("Couldn't update information")
            } else {
                location.href = `/profile/${profileUserId}`
            }
        }
    })
})

// Since the heart btn is dynamic content, it doesn't load until the page is ready.
// Which means that the time this code execute, the btns are not on the page.
$(document).on("click", ".likeBtn", (event) => {
    var button = $(event.target)
    var postId = getPostId(button)
    
    if(postId === undefined) return

    // Since we can't write $.put in ajax.
    $.ajax({
        url: `/api/posts/${postId}/like`, 
        type: "PUT",
        success: (postData) => {
            
            button.find("span").text(postData.likes.length || "")

            if(postData.likes.includes(userLoggedIn._id)){
                button.addClass("active")
            } else {
                button.removeClass("active")
            }
        }
    })
})

$(document).on("click", ".retweetBtn", (event) => {
    var button = $(event.target)
    var postId = getPostId(button)
    
    if(postId === undefined) return

    // Since we can't write $.put in ajax.
    $.ajax({
        url: `/api/posts/${postId}/retweet`, 
        type: "POST",
        success: (postData) => {

            button.find("span").text(postData.retweetUsers.length || "")

            if(postData.retweetUsers.includes(userLoggedIn._id)){
                button.addClass("active")
            } else {
                button.removeClass("active")
            }
        }
    })
})


$(document).on("click", ".post", (event) => {
    var element = $(event.target)
    var postId = getPostId(element)

    if(postId !== undefined && !element.is("button")){
        window.location.href = "/posts/" + postId
    }
})

$(document).on("click", ".followButton", (event) => {
    var button = $(event.target)
    var userId = button.data().user

    $.ajax({
        url: `/api/users/${userId}/follow`, 
        type: "PUT",
        success: (data, status, xhr) => {
            if(xhr.status == 404){
                alert("User not found")
                return 
            }

            var difference = 1;
            if(data.following && data.following.includes(userId)) {
                button.addClass("following");
                button.text("Following");
            }
            else {
                button.removeClass("following");
                button.text("Follow");
                difference = -1;
            }
            
            var followersLabel = $("#followersValue");
            if(followersLabel.length != 0) {
                var followersText = followersLabel.text();
                followersText = parseInt(followersText);
                followersLabel.text(followersText + difference);
            }
        }
    })
})

function getPostId(element) {
    var isRoot = element.hasClass("post")
    // .closest is a jquery function that goes up through the DOM three to find a parent with this class. 
    var rootElement = isRoot ? element : element.closest(".post")
    var postId = rootElement.data().id

    if(postId === undefined) return alert("Post id is undefined")    

    return postId
}

function createPostHtml(postData) {

    if(postData == null) return alert("post object is null");

    var isRetweet = postData.retweetData !== undefined;
    var retweetedBy = isRetweet ? postData.postedBy.username : null;
    postData = isRetweet ? postData.retweetData : postData;
    
    var postedBy = postData.postedBy;

    if(postedBy._id === undefined) {
        return console.log("User object not populated");
    }

    var displayName = postedBy.username
    var timestamp = timeDifference(new Date(), new Date(postData.createdAt))

    var retweetText = ""
    if(isRetweet){
        retweetText = `<span>
                        <i class="fa-solid fa-retweet"></i>
                        Retweeted by <a href=${retweetedBy}>@${retweetedBy}</a>
                    </span>`
    }

    var replyFlag = "";
    if(postData.replyTo && postData.replyTo._id) {
        
        if(!postData.replyTo._id) {
            return alert("Reply to is not populated");
        }
        else if(!postData.replyTo.postedBy._id) {
            return alert("Posted by is not populated");
        }

        var replyToUsername = postData.replyTo.postedBy.username;
        replyFlag = `<div class='replyFlag'>
                        Replying to <a href='/profile/${replyToUsername}'>@${replyToUsername}<a>
                    </div>`;

    }

    return `<div class="post" data-id="${postData._id}">
                <div class="postActionContainer">
                    ${retweetText}
                </div>
                <div class="mainContainer">
                    <div class="userImageContainer">
                        <img src="${postedBy.profilePic}">
                    </div>
                    <div class="postContentContainer">
                        <div class="header">
                            <a href="/profile/${postedBy.username}">${displayName}</a>
                            <span class="date">${timestamp}</span>
                        </div>
                        ${replyFlag}
                        <div class="postBody">
                            <span>${postData.textContent}</span>
                        </div>
                        <div class="postFooter">
                            <div class='postBtnContainer'>
                                <button data-bs-toggle='modal' data-bs-target='#replyModal'>
                                    <i class='far fa-comment'></i>
                                </button>
                            </div>
                            <div class="postBtnContainer green">
                                <button class="retweetBtn">
                                    <i class="fa-solid fa-retweet"></i>
                                    <span>${postData.retweetUsers.length || ""}</span>
                                </button>
                            </div>
                            <div class="postBtnContainer red">
                                <button class="likeBtn">
                                    <i class="far fa-heart"></i>
                                    <span>${postData.likes.length || ""}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`
}

function timeDifference(current, previous) {

    var msPerMinute = 60 * 1000;
    var msPerHour = msPerMinute * 60;
    var msPerDay = msPerHour * 24;
    var msPerMonth = msPerDay * 30;
    var msPerYear = msPerDay * 365;

    var elapsed = current - previous;

    if (elapsed < msPerMinute) {
        if(elapsed/1000 < 30) return "Just now"

         return Math.round(elapsed/1000) + ' seconds ago';   
    }

    else if (elapsed < msPerHour) {
         return Math.round(elapsed/msPerMinute) + ' minutes ago';   
    }

    else if (elapsed < msPerDay ) {
         return Math.round(elapsed/msPerHour ) + ' hours ago';   
    }

    else if (elapsed < msPerMonth) {
        return Math.round(elapsed/msPerDay) + ' days ago';   
    }

    else if (elapsed < msPerYear) {
        return Math.round(elapsed/msPerMonth) + ' months ago';   
    }

    else {
        return Math.round(elapsed/msPerYear ) + ' years ago';   
    }
}

function outputPosts(results, container) {
    container.html("");

    if(!Array.isArray(results)) {
        results = [results];
    }

    results.forEach(result => {
        var html = createPostHtml(result)
        container.append(html);
    });

    if (results.length == 0) {
        container.append("<span class='noResults'>Nothing to show.</span>")
    }
}

function outputPostsWithReplies(results, container) {
    container.html("");

    if(results.replyTo !== undefined && results.replyTo._id !== undefined) {
        var html = createPostHtml(results.replyTo)
        container.append(html);
    }

    var mainPostHtml = createPostHtml(results.postData)
    container.append(mainPostHtml);

    results.replies.forEach(result => {
        var html = createPostHtml(result)
        container.append(html);
    });

    if (results.length == 0) {
        container.append("<span class='noResults'>Nothing to show.</span>")
    }
}

function outputUsers(results, container) {
    container.html("");

    results.forEach(result => {
        var html = createUserHtml(result, true);
        container.append(html);
    });

    if(results.length == 0) {
        container.append("<span class='noResults'>No results found</span>")
    }
}

function createUserHtml(userData, showFollowButton) {

    var name = userData.firstName + " " + userData.lastName;
    var isFollowing = userLoggedIn.following && userLoggedIn.following.includes(userData._id);
    var text = isFollowing ? "Following" : "Follow"
    var buttonClass = isFollowing ? "followButton following" : "followButton"

    var followButton = "";
    if (showFollowButton && userLoggedIn._id != userData._id) {
        followButton = `<div class='followButtonContainer'>
                            <button class='${buttonClass}' data-user='${userData._id}'>${text}</button>
                        </div>`;
    }

    return `<div class='user'>
                <div class='userImageContainer'>
                    <img src='${userData.profilePic}'>
                </div>
                <div class='userDetailsContainer'>
                    <div class='header'>
                        <a href='/profile/${userData.username}'>${name}</a>
                        <span class='username'>@${userData.username}</span>
                    </div>
                </div>
                ${followButton}
            </div>`;
}