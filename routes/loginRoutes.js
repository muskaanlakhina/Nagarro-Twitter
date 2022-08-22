// Declaring what dependency I want.
const express = require("express");
const app = express()
const router = express.Router()
const bodyParser = require("body-parser")
const bcrypt = require("bcryptjs")
const User = require("../schemas/UserSchema")


app.set("view engine", "pug")
// When you need views, go to folder namned views.
app.set("views", "views")

app.use(bodyParser.urlencoded({ extended: false}))


// Handling the routes, not the server = app.
router.get("/", (req, res, next) => {
    res.status(200).render("login")
})

router.post("/", async (req, res, next) => {

    const payload = req.body

    if(req.body.logUsername && req.body.logPassword){
        const user = await User.findOne({ username: req.body.logUsername})
        .catch((error) => {
            console.log(error)
            payload.errorMessage = "Something went wrong."
            res.status(200).render("login", payload)
        })

        if(user != null){
            // We compare the crypted password with the one the user passed in.
            const result = await bcrypt.compare(req.body.logPassword, user.password)

            if(result === true){
                req.session.user = user
                return res.redirect("/")
            } 
        }
        payload.errorMessage = "Wrong login credentials."
        return res.status(200).render("login", payload)
    }

    payload.errorMessage = "Make sure each field has a valid value."
    res.status(200).render("login")
})

// Export it so we can use this file in other places.
module.exports = router