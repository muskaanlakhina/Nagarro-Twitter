const express = require("express");
const app = express()
const router = express.Router()
const bodyParser = require("body-parser")
const bcrypt = require("bcryptjs")
const User = require("../schemas/UserSchema")

router.get("/", (req, res, next) => {

    var payload = {
        pageTitle: req.session.user.username + "'s profile",
        userLoggedIn: req.session.user,
        userLoggedInJs: JSON.stringify(req.session.user),
        profileUser: req.session.user
    }

    res.status(200).render("profilePage", payload)
})

router.get("/:username", async (req, res, next) => {

    var payload = await getPayload(req.params.username, req.session.user)

    res.status(200).render("profilePage", payload)
})

router.get("/:username/replies", async (req, res, next) => {

    var payload = await getPayload(req.params.username, req.session.user)
    payload.selectedTab = "replies"
    res.status(200).render("profilePage", payload)
})

async function getPayload(username, userLoggedIn) {
    // Search for user using username.
    var user = await User.findOne({ username: username })

    if(user == null){

        // Search for user using ID.
        user = await User.findById(username)

        if(user == null){
            return {
                pageTitle: "User not found",
                userLoggedIn: userLoggedIn,
                userLoggedInJs: JSON.stringify(userLoggedIn)
            }
        }
    }
    return {
        pageTitle: user.username,
        userLoggedIn: userLoggedIn,
        userLoggedInJs: JSON.stringify(userLoggedIn),
        profileUser: user
    }
}

module.exports = router