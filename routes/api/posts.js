const express = require("express");
const app = express()
const router = express.Router()
const bodyParser = require("body-parser")
const User = require("../../schemas/UserSchema")
const Post = require("../../schemas/PostSchema")

app.use(bodyParser.urlencoded({ extended: false}))



router.get("/", async (req, res, next) => {

    var searchObject = req.query

    if(searchObject.isReply !== undefined) {
        var isReply = searchObject.isReply == "true"
        // Using the mongoDB operator to check if replyTo exist for the post.
        searchObject.replyTo = { $exists: isReply }
        delete searchObject.isReply
    }

    // $options: "i" means that the search will not be case sensitive.
    if(searchObject.search !== undefined) {
        searchObject.textContent = { $regex: searchObject.search, $options: "i" }
        delete searchObject.search
    }

    if(searchObject.followingOnly !== undefined){
        var followingOnly = searchObject.followingOnly == "true"

        if(followingOnly) {
            // Loop over all users the user is following from the schemas following array.
            var objectIds = []
            
            if(!req.session.user.following) {
                req.session.user.following = []
            }
            req.session.user.following.forEach(user => {
                objectIds.push(user)
            })

            objectIds.push(req.session.user._id)
            searchObject.postedBy = { $in: objectIds }
        }

        delete searchObject.followingOnly
    }

    var results = await getPosts(searchObject)
    res.status(200).send(results)
})

router.get("/start", async (req, res, next) => {

    var searchObject = req.query

    if(searchObject.isReply !== undefined) {
        var isReply = searchObject.isReply == "true"
        // Using the mongoDB operator to check if replyTo exist for the post.
        searchObject.replyTo = { $exists: isReply }
        delete searchObject.isReply
    }

    var results = await getPosts(searchObject)
    res.status(200).send(results)
})

router.get("/:id", async (req, res, next) => {

    var postId = req.params.id

    var postData = await getPosts({ _id: postId })
    // We know we only ever want one since it is one ID and getPosts function search is
    // by find() and not findOne().
    postData = postData[0]

    var results = {
        postData: postData
    }
    
    if(postData.replyTo !== undefined) {
        results.replyTo = postData.replyTo
    }

    // Checks if the post has a replyTo and matches the postId.
    results.replies = await getPosts({ replyTo: postId })

    res.status(200).send(results)
})

router.post("/", async (req, res, next) => {
    if(!req.body.content){
        console.log("Content param not sent with request")
        return res.sendStatus(400)
    }

    // Saving the data in the post in the PostSchema variables.
    var postData = {
        textContent: req.body.content,
        postedBy: req.session.user
    }

    if(req.body.replyTo){
        postData.replyTo = req.body.replyTo
    }

    // This create function returns a promise.
    Post.create(postData)
    .then(async newPost => {
        newPost = await User.populate(newPost, {path: "postedBy"})

        res.status(201).send(newPost)
    })
    .catch(error => {
        console.log(error)
        res.sendStatus(400)
    })
})

router.put("/:id/like", async (req, res, next) => {

    var postId = req.params.id
    var userId = req.session.user._id

    // Checking if they have a likes array already.
    var isLiked = req.session.user.likes && req.session.user.likes.includes(postId)

    var option = isLiked ? "$pull" : "$addToSet"

    // Insert user like
    req.session.user = await User.findByIdAndUpdate(userId, { [option]: {likes: postId} }, {new: true})
    .catch(error => {
        console.log(error)
        res.sendStatus(400)
    })

    // Insert post like
    var post = await Post.findByIdAndUpdate(postId, { [option]: {likes: postId} }, {new: true})
    .catch(error => {
        console.log(error)
        res.sendStatus(400)
    })

    res.status(200).send(post)
})

router.post("/:id/retweet", async (req, res, next) => {
    var postId = req.params.id;
    var userId = req.session.user._id;

    // Try and delete retweet
    var deletedPost = await Post.findOneAndDelete({ postedBy: userId, retweetData: postId })
    .catch(error => {
        console.log(error);
        res.sendStatus(400);
    })

    var option = deletedPost != null ? "$pull" : "$addToSet";

    var repost = deletedPost;

    if (repost == null) {
        repost = await Post.create({ postedBy: userId, retweetData: postId })
        .catch(error => {
            console.log(error);
            res.sendStatus(400);
        })
    }

    // This will either add the repost itself to the users list of retweet or remove it depending on 
    // what is in the option variable, which is decided above.
    req.session.user = await User.findByIdAndUpdate(userId, { [option]: { retweets: repost._id } }, { new: true })
    .catch(error => {
        console.log(error);
        res.sendStatus(400);
    })

    // Insert post like
    var post = await Post.findByIdAndUpdate(postId, { [option]: { retweetUsers: userId } }, { new: true })
    .catch(error => {
        console.log(error);
        res.sendStatus(400);
    })


    res.status(200).send(post)
})

async function getPosts(filter) {
    var results = await Post.find(filter)
    .populate("postedBy")
    .populate("retweetData")
    .populate("replyTo")
    .sort({"createdAt": -1})
    .catch(error => console.log(error))

    results = await User.populate(results, {path: "replyTo.postedBy"})
    return await User.populate(results, {path: "retweetData.postedBy"})
}

// Export it so we can use this file in other places.
module.exports = router