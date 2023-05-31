$(document).ready(() => {
    $.get("/api/notifications", (data) => {
        console.log(data)
        outPutNotificationList(data, $(".resultsContainer"));
    })  
})

$("#markNotificationsAsRead").click(() => markNotificationsAsOpened())
