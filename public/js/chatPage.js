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