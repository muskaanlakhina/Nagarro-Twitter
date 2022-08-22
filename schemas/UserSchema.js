const mongoose = require("mongoose")

const Schema = mongoose.Schema

const UserSchema = new Schema({
    username: {type: String, require: true, trim: true, unique: true},
    firstname: {type: String},
    lastname: {type: String},
    email: {type: String, unique: true},
    password: {type: String, require: true},
    profilePic: {type: String, default: "/images/profilePic.jpg"},
    likes: [{ type: Schema.Types.ObjectId, ref: "Post" }],
    retweets: [{ type: Schema.Types.ObjectId, ref: "Post" }],
    following: [{ type: Schema.Types.ObjectId, ref: "User" }],
    followers: [{ type: Schema.Types.ObjectId, ref: "User" }]
}, { timestamps: true })
// This will give a timestamp on every document inserted in this collection.


const User = mongoose.model("User", UserSchema)
module.exports = User