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
