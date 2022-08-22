// ********** Importing Modules **********
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const middleware = require('./middleware');


// ********** Using Modules **********
const app = express();
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
}));


// ********** Database Connection **********
mongoose.connect("mongodb+srv://muskaanlakhina:Muskaan@cluster0.x8yffad.mongodb.net/?retryWrites=true&w=majority").then(function () {
    console.log('Database Connection Successful');
}).catch(function (err) {
    console.log(`Error setting up connection to database: ${err}`);
});

// ********** Server listening on port: 3000 **********
const server = app.listen(process.env.PORT || 3000, function () {
    console.log('Server is running');
});
const io = require('socket.io')(server, {
    pingTimeout: 60000
});

// ********** Routes **********
// Home Route
app.get('/', middleware.isLoggedIn, function(req, res) {
    res.render('home', {userLoggedIn: req.session.user, home:'active'});
});

// Login Route
const loginRoutes = require('./routes/loginRoutes');
app.use('/login', loginRoutes);

// Register Route
const registerRoutes = require('./routes/registerRoutes');
app.use('/register', registerRoutes);

// Post Route
const postRoutes = require('./routes/postRoutes');
app.use('/post', middleware.isLoggedIn, postRoutes);

// Profile Route
const profileRoutes = require('./routes/profileRoutes');
app.use('/profile', middleware.isLoggedIn, profileRoutes);

// Upload Route
const uploadRoutes = require('./routes/uploadRoutes');
app.use('/uploads', middleware.isLoggedIn, uploadRoutes);

// Logout Route
const logoutRoutes = require('./routes/logoutRoutes');
app.use('/logout', middleware.isLoggedIn, logoutRoutes);

// Search Route
const searchRoutes = require('./routes/searchRoutes');
app.use('/search', middleware.isLoggedIn, searchRoutes);

// Messages Route
const messagesRoutes = require('./routes/messagesRoutes');
app.use('/messages', middleware.isLoggedIn, messagesRoutes);

// Notifications Route
const notificationsRoutes = require('./routes/notificationsRoutes');
app.use('/notifications', middleware.isLoggedIn, notificationsRoutes);

// ********** API Routes **********
// Posts Route
const postsApiRoute = require('./routes/api/posts');
app.use('/api/posts', postsApiRoute);

// Users Route
const usersApiRoute = require('./routes/api/users');
app.use('/api/users', usersApiRoute);

// Chats Route
const chatsApiRoute = require('./routes/api/chats');
app.use('/api/chats', chatsApiRoute);

// Messages Route
const messagesApiRoute = require('./routes/api/messages');
app.use('/api/messages', messagesApiRoute);

// Notifications Route
const notificationsApiRoute = require('./routes/api/notifications');
app.use('/api/notifications', notificationsApiRoute);

// Socket IO
io.on('connection', function(socket) {
    socket.on('setup', function(userData) {
        socket.join(userData._id);
        socket.emit('connected');
    });
    socket.on('join room', function(room) {
        socket.join(room);
    });
    socket.on('typing', function(room) {
        socket.in(room).emit('typing');
    });
    socket.on('stop typing', function(room) {
        socket.in(room).emit('stop typing');
    });
    socket.on('new message', function(newMessage) {
        const chat = newMessage.chat;
        if(!chat.users) return console.log('Chat.users is undefined');
        chat.users.forEach(function(user) {
            if(user._id == newMessage.sender._id) {
                return;
            }
            socket.in(user._id).emit('message received', newMessage);
        });
    });
    socket.on('notification received', function(room) {
        socket.in(room).emit('notification received', room);
    });
});