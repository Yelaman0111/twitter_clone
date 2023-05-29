const express = require("express");
const app = express();
const port = 3003;
const middleware = require("./middleware")
const path = require('path');
const bodyParser = require("body-parser");
const mongoose = require("./database");
const session = require("express-session");

const server = app.listen(port, () => { console.log("Server listening on port " + port); });

app.set("view engine", "pug");
app.set("views", "views");

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
    secret: "bbq chips",
    resave: true,
    saveUninitialized: false,
}));

//Routes
const loginRoute = require("./routes/loginRoutes");
const registerRoute = require("./routes/registerRoutes");
const logoutRoute = require("./routes/logout");
const postRoute = require("./routes/postRoutes");
const profileRoutes = require("./routes/profileRoutes");
const uploadsRoutes = require("./routes/uploadsRoutes");
const searchRoutes = require("./routes/searchRoutes");
const messagesRoutes = require("./routes/messagesRoutes");

//Api routes
const postApiRoute = require("./routes/api/posts");
const usersApiRoute = require("./routes/api/users");
const chatsApiRoute = require("./routes/api/chats");

app.use("/login", loginRoute);
app.use("/register", registerRoute);
app.use("/logout", logoutRoute);
app.use("/post", middleware.requireLogin, postRoute);
app.use("/profile", middleware.requireLogin, profileRoutes);
app.use("/uploads", uploadsRoutes);
app.use("/search", middleware.requireLogin, searchRoutes);
app.use("/messages", middleware.requireLogin, messagesRoutes);

app.use("/api/posts", postApiRoute);
app.use("/api/users", usersApiRoute);
app.use("/api/chats", chatsApiRoute);

app.get("/", middleware.requireLogin, (req, res, next) => {

    var payload = {
        pageTitle: "Home",
        userLoggedIn: req.session.user,
        userLoggedInJs: JSON.stringify(req.session.user),
    }
    
    res.status(200).render("home", payload);
});