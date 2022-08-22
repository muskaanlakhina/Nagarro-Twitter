// Declaring what dependency I want.
const express = require("express");
const app = express()
//const PORT = 3007;
const middleware = require("./middleware")
const path = require("path")
const bodyParser = require("body-parser")
const mongoose = require("./database")
const session = require("express-session")

app.set("view engine", "pug")
// When you need views, go to folder namned views.
app.set("views", "views")

app.use(bodyParser.urlencoded({ extended: false}))
// If something might change in the path this is the safer way to write. 
app.use(express.static(path.join(__dirname, "public")))

app.use(session({
    // We pass in a String and it hashes the session with it. 
    secret: "oboy",
    resave: true,
    // The reasoning behind this is that this will prevent a lot of empty session objects being stored in the session store. 
    saveUninitialized: false
}))

// Routes
const loginRoute = require('./routes/loginRoutes')
const registerRoute = require('./routes/registerRoutes')
const logoutRoute = require('./routes/logoutRoutes')
const postRoute = require('./routes/postRoutes')
const profileRoute = require('./routes/profileRoutes')
const startRoute = require('./routes/startRoutes')
const uploadRoute = require('./routes/uploadsRoutes')
const searchRoute = require('./routes/searchRoutes')

// Api routes
const postsApiRoute = require('./routes/api/posts')
const usersApiRoute = require('./routes/api/users')

app.use("/login", loginRoute)
app.use("/register", registerRoute)
app.use("/logout", logoutRoute)
app.use("/posts", middleware.requireLogin, postRoute)
app.use("/profile", middleware.requireLogin, profileRoute)
app.use("/start", startRoute)
app.use("/uploads", uploadRoute)
app.use("/search", middleware.requireLogin, searchRoute)

app.use("/api/posts", postsApiRoute)
app.use("/api/users", usersApiRoute)

// Adding req = request from client and res = response from server parameter.
app.get("/", middleware.requireLogin, (req, res, next) => {

    const payload = {
        pageTitle: "Your home page", 
        userLoggedIn: req.session.user,
        userLoggedInJs: JSON.stringify(req.session.user)
    }

    // Render function takes two parameters.
    // 1. template/page 'home' 2. The payload with the data we want to send to it.
    res.status(200).render("home", payload)
})


// Telling express to listen to port 3000.
const server = app.listen(process.env.PORT || 5000, () => {
    console.log(`Server listening on port`)
})