// Declaring what dependency I want.
const express = require("express");
const app = express()
const router = express.Router()
const bodyParser = require("body-parser")
const bcrypt = require("bcryptjs")
const User = require("../schemas/UserSchema")

app.use(bodyParser.urlencoded({ extended: false}))

// Handling the routes, not the server = app.
router.get("/", (req, res, next) => {

    if(req.session){
        req.session.destroy(() => {
            res.redirect("/login")
        })
    }
})

// Export it so we can use this file in other places.
module.exports = router