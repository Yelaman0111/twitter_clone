//Globals
var cropper;
var timer;
var selectedUsers = []; 

$("#postTextarea, #replyTextarea").keyup(event => {
    var textbox = $(event.target);
    var value = textbox.val().trim();
    var isModal = textbox.parents(".modal").length == 1;
    
    var submitButton = isModal ? $("#submitReplyButton") : $("#submitPostButton");
    console.log("booo " + submitButton);

    if(submitButton.length == 0) return alert("No submit btn found");

    if(value == "") {
        submitButton.prop("disabled", true);
        return;
    }

    submitButton.prop("disabled", false);
});

$("#submitPostButton, #submitReplyButton").click((event) => {
    var button = $(event.target);
    var isModal = button.parents(".modal").length == 1;
    var textbox = isModal ? $("#replyTextarea") : $("#postTextarea");

    var data = {
        content: textbox.val()
    }

    if(isModal) {
        var postId = button.data().id;
        if(postId == null) return console.log("id is null");
        data.replyTo = postId;
    }

    $.post("/api/posts", data, (postData, status, xhr) => {

        if(postData.replyTo){
            location.reload();
        }else{
            var html = createPosthtml(postData);
            $(".postsContainer").prepend(html);
            textbox.val("");
            button.prop("disabled", true);
        }

    });
});

$("#replyModal").on("show.bs.modal", (event) => {
    var button = $(event.relatedTarget);
    var postId = getPostIdFromElement(button);
    $("#submitReplyButton").data("id", postId);

    $.get(`/api/posts/${postId}`, result => {
        outputPosts(result.postData, $("#originalPostContainer"));
    });
})

$("#replyModal").on("hidden.bs.modal", () => {
    $("#originalPostContainer").html("");
    $("#replyTextarea").val("");
})

$("#deletePostModal").on("show.bs.modal", (event) => {
    var button = $(event.relatedTarget);
    var postId = getPostIdFromElement(button);
    $("#deletePostButton").data("id", postId);
})

$("#confirmPinPostModal").on("show.bs.modal", (event) => {
    var button = $(event.relatedTarget);
    var postId = getPostIdFromElement(button);
    $("#confirmPinPostModalButton").data("id", postId);
})

$("#confirmUnPinPostModal").on("show.bs.modal", (event) => {
    var button = $(event.relatedTarget);
    var postId = getPostIdFromElement(button);
    $("#confirmUnPinPostModalButton").data("id", postId);
})

$("#deletePostButton").click((event) => {
    var id = $(event.target).data("id");

    $.ajax({
        url: `/api/posts/${id}`,
        type: "DELETE",
        success: (data, status, xhr) => {
            if(xhr.status != 202){
                console.log("could not delete post");
            }else{
                location.reload();
            }
        }
    })

});

$("#confirmPinPostModalButton").click((event) => {
    var id = $(event.target).data("id");

    $.ajax({
        url: `/api/posts/${id}`,
        data: { pinned: true},
        type: "PUT",
        success: (data, status, xhr) => {
            if(xhr.status != 204){
                console.log("could not pin post");
            }else{
                location.reload();
            }
        }
    })

});

$("#confirmUnPinPostModalButton").click((event) => {
    var id = $(event.target).data("id");

    $.ajax({
        url: `/api/posts/${id}`,
        data: { pinned: false},
        type: "PUT",
        success: (data, status, xhr) => {
            if(xhr.status != 204){
                console.log("could not pin post");
            }else{
                location.reload();
            }
        }
    })

});

$("#filePhoto").change(function() {
    if(this.files && this.files[0]) {
        var reader = new FileReader();
        reader.onload = (e) => {
            var image = document.getElementById("imagePreview");
            image.src = e.target.result;

            if(cropper !== undefined){
                cropper.destroy();
            }

            cropper = new Cropper(image, {
                aspectRatio: 1 / 1,
                background: false
            });

        }
        reader.readAsDataURL(this.files[0]);
    }
})

$("#coverPhoto").change(function() {
    if(this.files && this.files[0]) {
        var reader = new FileReader();
        reader.onload = (e) => {
            var image = document.getElementById("coverPreview");
            image.src = e.target.result;

            if(cropper !== undefined){
                cropper.destroy();
            }

            cropper = new Cropper(image, {
                aspectRatio: 16 / 9,
                background: false
            });

        }
        reader.readAsDataURL(this.files[0]);
    }
})

$("#imageUploadButton").click(() => {
    var canvas = cropper.getCroppedCanvas();

    if(canvas == null){
        console.log("could not upload image.");
        return;
    } 

    canvas.toBlob((blob) => {
        var formData = new FormData();
        formData.append("croppedImage", blob);

        $.ajax({
            url: "/api/users/profilePicture",
            type: "POST",
            data: formData,
            processData: false,
            contentType: false,
            success: () => location.reload()
        });
    });
});

$("#coverPhotoUploadButton").click(() => {
    var canvas = cropper.getCroppedCanvas();

    if(canvas == null){
        console.log("could not upload image.");
        return;
    }

    canvas.toBlob((blob) => {
        var formData = new FormData();
        formData.append("croppedImage", blob);

        $.ajax({
            url: "/api/users/coverPhoto",
            type: "POST",
            data: formData,
            processData: false,
            contentType: false,
            success: () => location.reload()
        });
    });
});

$("#userSearchTextbox").keydown((event) => {
    clearTimeout(timer);
    var textBox = $(event.target);
    var value = textBox.val();

    if(value == "" && event.keyCode == 8){
        //remove user from selection
        selectedUsers.pop();
        updatedSelectedUsersHtml();
        $(".resultsContainer").html("");

        if(selectedUsers.length == 0){
            $("#createChatButton").prop("disabled", true);
        }
        return;
    }

    timer = setTimeout(() => {
        value = textBox.val().trim();

        if(value == ""){
            $(".resultsContainer").html("");
        }else{
            searchUsers(value);
        }
    }, 1000);
});

$("#createChatButton").click(function() {
    var data = JSON.stringify(selectedUsers);

    $.post("/api/chats", { users: data }, chat => {
        if(!chat || !chat._id) return console.log("invalid response from server");
        window.location.href = `/messages/${chat._id}`;
    });
})

$(document).on("click" , ".likeButton", (event) => {

    var button = $(event.target);
    var postId = getPostIdFromElement(button);

    if(postId === undefined) return;

    $.ajax({
        url: `/api/posts/${postId}/like`,
        type: "PUT",
        success: (postData) => {
            button.find("span").text(postData.likes.length || "");

            if(postData.likes.includes(userLoggedIn._id)){
                button.addClass("active");
            }
            else {
                button.removeClass("active");
            }
        }
    })

});

$(document).on("click" , ".retweetButton", (event) => {

    var button = $(event.target);
    var postId = getPostIdFromElement(button);

    if(postId === undefined) return;

    $.ajax({
        url: `/api/posts/${postId}/retweet`,
        type: "POST",
        success: (postData) => {
            button.find("span").text(postData.retweetUsers.length || "");

            if(postData.retweetUsers.includes(userLoggedIn._id)){
                button.addClass("active");
            }
            else {
                button.removeClass("active");
            }
        }
    })

});

$(document).on("click" , ".post", (event) => {

    var element = $(event.target);
    var postId = getPostIdFromElement(element);

    if(postId !== undefined && !element.is("button")) {
        window.location.href = '/post/' + postId;
    };

    
});

$(document).on("click" , ".followButton", (event) => {
    var button = $(event.target);
    var userId = button.data().user;

    $.ajax({
        url: `/api/users/${userId}/follow`,
        type: "PUT",
        success: (data, status, xhr) => {

            if(xhr.status == 404) console.log("Error");

            var difference = 1;
            if(data.following && data.following.includes(userId)){
                button.addClass("following");
                button.text("Following");
            }
            else {
                button.removeClass("following");
                button.text("Follow");
                difference = -1;
            }

            var followersLabel = $("#followerValue");
            if(followersLabel != 0){
                var followersText = parseInt(followersLabel.text());
                followersLabel.text(followersText + difference);
            }
        }
    })
});

function getPostIdFromElement(element){
    var isRoot = element.hasClass("post");
    var rootElement = isRoot ? element : element.closest(".post");
    var postId = rootElement.data().id;
    
    if(postId === undefined) return console.log("post id undefined");
    return postId;
}

function createPosthtml(postData, largeFont = false){

    if(postData == null) return console.log("post object is null");

    var isRetweet = postData.retweetData !== undefined;
    var retweetedBy = isRetweet ? postData.postedBy.username : null;
    postData = isRetweet ? postData.retweetData : postData;

    var postedBy = postData.postedBy;

    if(postedBy._id === undefined) {
        return console.log("User object not populated!");
    }

    var displayName = postedBy.firstName + " " + postedBy.lastName;
    var timestamp = timeDifference(new Date(), new Date(postData.createdAt));
    var likeButtonActiveClass = postData.likes.includes(userLoggedIn._id) ? "active" : "";
    var retweetButtonActiveClass = postData.retweetUsers.includes(userLoggedIn._id) ? "active" : "";
    var largeFontClass = largeFont ? "largeFont" : "";
    var retweetText = "";
    if(isRetweet) {
        retweetText = `<span>
                            <i class='fas fa-retweet'></i>
                            Retweeted by <a href='/profile/${retweetedBy}'>@${retweetedBy} </a>
                        </span>`;
    }

    var replyFlag = "";
    if(postData.replyTo && postData.replyTo._id){
        if(!postData.replyTo._id) console.log("Reply to is not populated");
        if(!postData.replyTo.postedBy._id) console.log("posted By is not populated");

        var replyToUsername = postData.replyTo.postedBy.username;
        replyFlag = `<div class='replyFlag'> 
                    Replying to <a href='/profile/${replyToUsername}'>@${replyToUsername}</a>
                    </div>`
    }

    var buttons = "";
    var pinnedPostText = "";
    if(postData.postedBy._id == userLoggedIn._id){
        
        var pinnedClass = "";
        var dataTarget = "#confirmPinPostModal"
        if(postData.pinned === true){
            pinnedClass = "pinned";
            dataTarget = "#confirmUnPinPostModal"
            pinnedPostText = "<i class='fas fa-thumbtack'> </i><span>Pinned post</span>";
        }

        buttons = `
                <button class="pinnedButton ${pinnedClass}" data-id=${postData._id} data-bs-toggle='modal' data-bs-target='${dataTarget}'>
                    <i class='fas fa-thumbtack'></i>
                </buton>
                <button data-id=${postData._id} data-bs-toggle='modal' data-bs-target='#deletePostModal'>
                    <i class='fas fa-times'></i>
                </buton>` 
    }

    return `<div class='post ${largeFontClass}' data-id='${postData._id}'>
                <div class = 'postActionContainer'>
                    ${retweetText}
                </div>
                <div class='mainContentContainer'>
                    <div class='userImageContainer'>
                        <img src='${postedBy.profilePic}'>
                    </div>
                    <div class='postContentContainer'>
                        <div class='pinnedPostText'>
                            ${pinnedPostText}
                        </div>
                        <div class='header'>
                            <a href='/profile/${postedBy.username}' class='displayName'>${displayName}</a>
                            <span class='username'>@${postedBy.username}</span>
                            <span class='date'>${timestamp}</span>
                            ${buttons}
                        </div>
                        ${replyFlag}
                        <div class='postBody'>
                            <span>${postData.content} </span>
                        </div>
                        <div class='postFooter'>
                            <div class='postButtonContainer'>
                                <button data-bs-toggle='modal' data-bs-target='#replyModal'> 
                                    <i class='far fa-comment'></i>
                                </button> 
                            </div>
                            <div class='postButtonContainer green'>
                                <button class='retweetButton  ${retweetButtonActiveClass}'> 
                                    <i class='fas fa-retweet'></i>
                                    <span>${postData.retweetUsers.length || "" }</span>
                                </button> 
                            </div>
                            <div class='postButtonContainer red'>
                                <button class='likeButton ${likeButtonActiveClass}'> 
                                    <i class='far fa-heart'></i>
                                    <span>${postData.likes.length || "" }</span>
                                </button> 
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;
}

function timeDifference(current, previous) {

    var msPerMinute = 60 * 1000;
    var msPerHour = msPerMinute * 60;
    var msPerDay = msPerHour * 24;
    var msPerMonth = msPerDay * 30;
    var msPerYear = msPerDay * 365;

    var elapsed = current - previous;

    if (elapsed < msPerMinute) {
        if(elapsed/1000 < 30) return "Just now";

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
    if(!Array.isArray(results)){
        results = [results];
    }
    results.forEach(result => {
        var html = createPosthtml(result);
        container.append(html);
    });

    if(results.length == 0) {
        container.append("<span class='noResults'>Nothing to show. </span>");
    }
}

function outputPostsWithReplies(results, container) {
    container.html("");
    
    if(results.replyTo !== undefined && results.replyTo._id !== undefined) {
        var html = createPosthtml(results.replyTo);
        container.append(html);
    }
    var mainPosthtml = createPosthtml(results.postData, true);
    container.append(mainPosthtml);

    results.replies.forEach(result => {
        var html = createPosthtml(result);
        container.append(html);
    });
}

function outputUsers(results, container){
    container.html("");

    if(results.length == 0) {
        container.append("<span class='noResults'>No results found </span>");
    }

    results.forEach(result => {
        var html = createUserHtml(result, true);
        container.append(html);
    });
}

function createUserHtml(userData, showFollowButton){
    var name = userData.firstName + " " +  userData.lastName;
    var isFollowing = userLoggedIn.following && userLoggedIn.following.includes(userData._id);
    var text = isFollowing ? "Following" : "Follow";
    var buttonClass = isFollowing ? "followButton following" : "followButton";

    var followButton = "";
    if(showFollowButton && userLoggedIn._id != userData._id){
        followButton = `<div class="followButtonContainer">
                            <button class='${buttonClass}' data-user='${userData._id}'>${text}</button>
                        </div>`
    }
    return `<div class="user">
                <div class="userImageContainer">
                    <img src="${userData.profilePic}">
                </div>
                <div class="userDetailsContainer">
                    <div class="header">
                        <a href="/profile/${userData.username}">${name}</a>
                        <span class="username">@${userData.username}</span>
                    </div>
                </div>
                ${followButton}
            </div>
    `;
}

function searchUsers(searchterm){
    $.get("/api/users", { search: searchterm}, results => {
        outputSelectableUsers(results, $(".resultsContainer"));
    });
}

function outputSelectableUsers(results, container){
    container.html("");

    if(results.length == 0) {
        container.append("<span class='noResults'>No results found </span>");
    }

    results.forEach(result => {

        if(result._id == userLoggedIn._id || selectedUsers.some(u => u._id == result._id)){
            return;
        }

        var html = createUserHtml(result, false);
        var element = $(html);
        element.click(() => userSelected(result));
        container.append(element);
    });
}

function userSelected(user){
    selectedUsers.push(user);
    updatedSelectedUsersHtml();
    $("#userSearchTextbox").val("").focus();
    $(".resultsContainer").html("");
    $("#createChatButton").prop("disabled", false);
}

function updatedSelectedUsersHtml(){
    var elements = [];

    selectedUsers.forEach(user => {
        var name = user.firstName + " " + user.lastName;

        var userElement = $(`<span class="selectedUser">${name}</span>`);

        elements.push(userElement);
    })
    $(".selectedUser").remove();
    $("#selectedUsers").prepend(elements);
}