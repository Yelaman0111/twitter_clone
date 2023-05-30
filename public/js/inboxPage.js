$(document).ready(() => {
    $.get("/api/chats", (data, status, xhr) => {
        if(xhr.status == 400) {
            console.log("Could not get chat list.");
        }else{
            outputChatList(data, $('.resultsContainer'));
        }
    })
});

function outputChatList(chatList, container) {
    chatList.forEach(chat => {
        var html = createChatHtml(chat);
        container.append(html);
    });

    if(chatList.length == 0){
        container.append("<span class='noResults'>Nothind to show.</span>")
    }
}

function createChatHtml(chatData){
    var chatName = getChatName(chatData);
    var image = getChatImageElement(chatData);
    var latestMessage = getLatestMessage(chatData.latestMessage);

    return `<a href="/messages/${chatData._id}" class="resultListItem">
                ${image}
                <div class="resultDetailsContainer ellipsis">
                    <span class = 'heading ellipsis'>${chatName}</span>
                    <span class = 'subText ellipsis'>${latestMessage}</span>
                </div>
            </a>`;
}

function getLatestMessage(latestMessage){

    if(latestMessage != null ){
        console.log(latestMessage)
        var sender = latestMessage.sender;
        return `${sender.firstName} ${sender.lastName}: ${latestMessage.content}`;
        }

    return "New chat";
}

function getChatImageElement(chatData){
    var otherChatUsers = getOtherChatUsers(chatData.users);

    var groupChatClass = "";
    var chatImage = getUserChatImageElment(otherChatUsers[0]);

    if(otherChatUsers.length > 1){
        groupChatClass = "groupChatImage";
        chatImage += getUserChatImageElment(otherChatUsers[1]);
    }

    return `<div class="resultsImageContainer ${groupChatClass}">${chatImage}</div>`;


}
function  getUserChatImageElment(user){
    if(!user || !user.profilePic) {
        return console.log("user passed into function is invalid");
    }

    return `<img src='${user.profilePic}' alt="Chat pic">`
}