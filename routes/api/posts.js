// ********** Importing Modules **********
const express = require('express');
const Post = require('../../schema/postSchema');
const User = require('../../schema/userSchema');
const Notification = require('../../schema/notificationSchema');


// ********** Using Modules **********
const router = express.Router();


// ********** Post Request: /api/posts/ **********
router.post('/', function(req, res) {
    if(!req.body.content) {
        console.log('Content not sent with the request');
        return res.sendStatus(400).redirect('/');
    }
    const postData = new Post({
        content: req.body.content,
        postedBy: req.session.user,
        replyTo: req.body.replyTo,
        pinned: false
    });
    postData.save().then(async function(newPost) {
        newPost = await User.populate(newPost, {path: 'postedBy'});
        newPost = await Post.populate(newPost, {path: 'replyTo'});
        newPost = await Post.populate(newPost, {path: 'replyTo.replyTo'});
        newPost = await User.populate(newPost, {path: 'replyTo.replyTo.postedBy'});
        newPost = await User.populate(newPost, {path: 'replyTo.postedBy'});
        if(newPost.replyTo) {
            await Notification.insertNotification(newPost.replyTo.postedBy, req.session.user, 'reply', newPost._id); 
        }
        res.status(201).send(newPost);
    }).catch(function(err) {
        console.log(err);
        res.sendStatus(400);
    });
});


// ********** Get Request: /api/posts/ **********
router.get('/', async function(req, res) {
    const objectIds = [...req.session.user.following];
    objectIds.push(req.session.user._id);
    const posts = await findAndPopulate({postedBy: {$in: objectIds}});
    if(posts === null) {
        res.sendStatus(400);
    }
    else {
        posts.sort(function(a, b) {
            return a.createdAt - b.createdAt;
        });
        res.status(201).send(posts);
    }
});


// ********** Get Request: /api/posts/search/_value_ **********
router.get('/search/:value', async function(req, res) {
    const posts = await findAndPopulate({content: {$regex: req.params.value, $options: 'i' }});
    if(posts === null) {
        res.sendStatus(400);
    }
    else {
        posts.sort(function(a, b) {
            return a.createdAt - b.createdAt;
        });
        res.status(201).send(posts);
    }
});

// ********** Get Request: /api/posts/_id_ **********
router.get('/:postId', async function(req, res) {
    const result = {};
    const postData = await findAndPopulate({_id: req.params.postId});
    if(postData[0].replyTo) {
        result.replyTo = postData[0].replyTo;
    }
    result.postData = postData;
    result.replies = await findAndPopulate({replyTo: req.params.postId});
    res.status(200).send(result);
})


// ********** Get Request: /api/posts/_id_/posts **********
router.get('/:id/posts', async function(req, res) {
    const posts = await findAndPopulate({$or: [
        {postedBy: req.params.id, replyTo: {$exists: false}},
        {postedBy: req.params.id, retweetData: {$exists: true}}
    ]});
    res.status(201).send(posts);
});


router.get('/:userId/pinnedPost', async function(req, res) {
    const postData = await findAndPopulate({postedBy: req.params.userId, pinned: true})
    res.status(200).send(postData[0]);
})


// ********** Get Request: /api/posts/_id_/posts **********
router.get('/:id/posts', async function(req, res) {
    const posts = await findAndPopulate({$or: [
        {postedBy: req.params.id, replyTo: {$exists: false}},
        {postedBy: req.params.id, retweetData: {$exists: true}}
    ]});
    res.status(201).send(posts);
});


// ********** Get Request: /api/posts/_id_/replies **********
router.get('/:id/replies', async function(req, res) {
    const posts = await findAndPopulate({
        postedBy: req.params.id,
        replyTo: {$exists: true},
        retweetData: {$exists: false}
    });
    
    res.status(201).send(posts);
})


// ********** Patch Request (Like): /api/posts/_id_/like **********
router.patch('/:id/like', async function(req, res) {
    const postId = req.params.id;
    const userId = req.session.user._id;
    const isLiked = req.session.user.likes?.includes(postId);
    const option = isLiked? '$pull' : '$addToSet';
    // Insert user like
    req.session.user = await User.findByIdAndUpdate(userId, 
        {[option]: {likes: postId}},
        {new: true}
    ).catch(function(err) {
        console.log(err);
        res.sendStatus(400);
    });
    // Insert post like
    const post = await Post.findByIdAndUpdate(postId, 
        {[option]: {likes: userId}}, 
        {new: true}
    ).catch(function(err) {
        console.log(err);
        res.sendStatus(400);
    });
    if(!isLiked) {
        await Notification.insertNotification(post.postedBy, userId, 'postLike', post._id)
        .catch((err) => console.log(err));
    }
    res.send(post);
});


// ********** Patch Request (Retweet): /api/posts/_id_/retweet **********
router.post('/:id/retweet', async function(req, res) {
    const postId = req.params.id;
    const userId = req.session.user._id;
    const deleteRetweet = await Post.findOneAndDelete({postedBy: userId, retweetData: postId})
    .catch(function(err) {
        console.log(err);
        res.sendStatus(400);
    })
    const option = deleteRetweet? '$pull' : '$addToSet';
    let repost = deleteRetweet;
    // Insert user retweet
    if(!repost) {
        const newPost = new Post({
            postedBy: userId,
            retweetData: postId
        });
        const post = await Post.findById(postId);
        if(post.replyTo) {
            newPost.replyTo = post.replyTo;
        }
        repost = await newPost.save().catch(function(err) {
            console.log(err);
            res.sendStatus(400);
        });
    }
    // Update user retweet
    req.session.user = await User.findByIdAndUpdate(userId, {[option]: {retweets: repost._id}}, {new: true})
    .catch(function(err) {
        console.log(err);
        res.sendStatus(400);
    });

    // Update post retweet
    const post = await Post.findByIdAndUpdate(postId, {[option]: {retweetUsers: userId}}, {new: true})
    .catch(function(err) {
        console.log(err);
        res.sendStatus(400);
    });
    if(!deleteRetweet) {
        await Notification.insertNotification(post.postedBy, userId, 'retweet', post._id); 
    }
    res.send(post);
});

// ********** Patch Request (Retweet): /api/posts/_id_ **********
router.delete('/:postId', async function(req, res) {
    const post = await Post.findById(req.params.postId);
    if(post.retweetUsers.includes()) {

    }
    Post.deleteMany({retweetData: req.params.postId})
    .catch(function(err) {
        console.log(err);
        res.sendStatus(400);
    });
    Post.findOneAndDelete({_id: req.params.postId, postedBy: req.session.user._id})
    .then(res.sendStatus(202))
    .catch(function(err) {
        console.log(err);
        res.sendStatus(400);
    });
});

// ********** Patch Request (Pin): /api/posts/_id_ **********
router.patch('/:postId', async function(req, res) {
    if(req.body.pinned !== undefined) {
        await Post.updateMany({postedBy: req.session.user._id}, {pinned: false})
        .catch(function(err) {
            console.log(err);
        })
    }
    Post.findByIdAndUpdate(req.params.postId, req.body)
    .then(res.sendStatus(204))
    .catch(function(err) {
        console.log(err);
        res.sendStatus(400);
    });
});

// Populate Posts utility function
async function findAndPopulate(query) {
    let posts = await Post.find(query);
    posts = await User.populate(posts, {path: 'postedBy'});
    posts = await Post.populate(posts, {path: 'retweetData'});
    posts = await User.populate(posts, {path: 'retweetData.postedBy'});
    posts = await Post.populate(posts, {path: 'retweetData.replyTo'});
    posts = await Post.populate(posts, {path: 'replyTo'});
    posts = await Post.populate(posts, {path: 'replyTo.replyTo'});
    posts = await User.populate(posts, {path: 'replyTo.replyTo.postedBy'});
    posts = await User.populate(posts, {path: 'replyTo.postedBy'});
    posts = await User.populate(posts, {path: 'retweetData.replyTo.postedBy'});
    return posts;
}



module.exports = router;