var connected = false;

var socket = io("http://localhost:3003");

socket.emit("setup", userLoggedIn);

socket.on("connected", () => {
    connected = true;
})

socket.on("message recieved", (newMessage) => messageRecieved(newMessage));

socket.on("notification recieved", () => {
    $.get("/api/notifications/latest", (notData) => {
        showNotificationPopup(notData)
        refreshMessagesNotifications();
    })
})

function emmitNotification(userId) {
    if(userId == userLoggedIn) return;
    socket.emit("notification recieved", userId);
}