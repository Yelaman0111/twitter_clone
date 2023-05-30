$(document).ready(() => {
    $.get(`/api/chats/${chatId}`, (data) => $("#chatName").text(getChatName(data)) );

    $.get(`/api/chats/${chatId}/messages`, (data) => {
        var messages = [];
        var lastSenderId = "";


        data.forEach((message, index) => {
            var html = createMessageHtml(message, data[index+1], lastSenderId);
            messages.push(html);
            lastSenderId = message.sender._id;
        });

        var messagesHtml = messages.join("");
        addMessagesHtmlToPage(messagesHtml);
        scrollToBottom(false);
        $(".loadingSpinnerContainer").remove();
        $(".chatContainer").css("visibility", "visible");
    })
})

$("#editChatNameButton").click(()=> {
    var name = $("#chatNameTextbox").val().trim();

    $.ajax({
        url:"/api/chats/" + chatId,
        type: "PUT",
        data: {chatName: name},
        success: (data, status, xhr) => {
            if(xhr.status != 204){
                console.log("could not update");
            }else{
                location.reload();
            }
        }
    })


})

$(".inputTexbox").keydown((event) => {
    if(event.which === 13 && !event.shiftKey){
        messageSubmited();
        return false;
    }
})

$(".sendMessageButton").click(() => {
    messageSubmited()
})

function messageSubmited() {
    var content = $(".inputTexbox").val().trim();
    if(content != ""){
        sendMessage(content);
        $(".inputTexbox").val("");
    }
}

function sendMessage(content){

    $.post("/api/messages", { content: content, chatId: chatId }, (data, status, xhr) => {

        if(xhr.status != 201){
            console.log("could not send message");
            $(".inputTexbox").val(content);
            return;
        }
        addChatMessageHtml(data);
    });
}

function addMessagesHtmlToPage(html){
    $(".chatMessages").append(html);
}

function addChatMessageHtml(message){
    if(!message || !message._id){
        console.log("message is not valid");
        return
    }

    var messageDiv = createMessageHtml(message, null, "");

    $(".chatMessages").append(messageDiv);
    scrollToBottom(true);

}

function createMessageHtml(message, nextMessage, lastSenderId){

    var sender = message.sender;
    var senderName = sender.firstName + " " + sender.lastName;
    var currentSenderId = sender._id;
    var nextSenderId = nextMessage != null ? nextMessage.sender._id : "";

    var isFirst = lastSenderId != currentSenderId; 
    var isLast = nextSenderId != currentSenderId; 

    var isMine = message.sender._id == userLoggedIn._id;
    var liClassName = isMine ? "mine" : "theirs";

    var nameElement = "";
    if(isFirst){
        liClassName += " first";
        if(!isMine){
            nameElement = `<span class='senderName'>${senderName}</span>`;
        }
    }

    var profileImage = "";
    if(isLast){
        liClassName += " last";
        profileImage = `<img src='${sender.profilePic}'>`
    }

    var imageContainer = "";
    if(!isMine){
        imageContainer = `<div class='imageContainer'>
                            ${profileImage}
                        </div>`
    }


    return `<li class="message ${liClassName}">
                ${imageContainer}
                <div class="messageContainer">
                    ${nameElement}
                    <span class="messageBody"> 
                        ${message.content}
                    </span>
                </div>
            </li>`;
}

function scrollToBottom(animated){
    var container = $(".chatMessages");
    var scrollHeight = container[0].scrollHeight;

    if(animated){
        container.animate({ scrollTop: scrollHeight }, "slow");
    }else{
        container.scrollTop(scrollHeight);
    }
}