var createError = require('http-errors');
const mongoose = require('mongoose');
require('dotenv').config();
var express = require('express');
const cors = require("cors");
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const expressSession = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const router = require("./router")
const Freelancer = require('./models/freelancer');
const Client = require('./models/client');
const Message = require('./models/message');

const http = require('http');
const { Server } = require('socket.io');
const allowedOrigins = ["http://localhost:5173", "https://diverr-frontend-jammy808s-projects.vercel.app" , "https://diverr-e8czcyeth2dpf8ek.canadacentral-01.azurewebsites.net"];

var app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors:{
    origin: '*',
    methods: ['GET' , 'POST'],
  }
})

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Join a specific gig room for chat
  socket.on('joinGig', (gigId) => {
    socket.join(gigId);
    console.log(`User joined gig room: ${gigId}`);
  });

  // Listen for new messages
  socket.on('sendMessage', async (data) => {
    const { senderId, senderModel, gigId, content } = data;

    // Save message to MongoDB
    const newMessage = new Message({ sender: senderId, senderModel, gig: gigId, content });
    await newMessage.save();

    // Emit the message to all clients in the gig room
    io.to(gigId).emit('receiveMessage', newMessage);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(
  cors({
    origin: function (origin, callback) {
      if (allowedOrigins.includes(origin) || !origin) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // Allow credentials (cookies) to be sent
  })
);

app.set("trust proxy", 1); // Enable trust proxy for secure cookies in production

app.use(
  expressSession({
    secret: "yoyo whatup",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production", // Secure cookies in production
      httpOnly: true,
      sameSite: "none",
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Passport Strategy for Freelancer
passport.use('freelancer-local', new LocalStrategy(Freelancer.authenticate()));
// Passport Strategy for Client
passport.use('client-local', new LocalStrategy(Client.authenticate()));

passport.serializeUser((user, done) => {
  done(null, { id: user.id, type: user.constructor.modelName });
});

passport.deserializeUser((obj, done) => {
  let UserModel;

  if (obj.type === 'Freelancer') {
    UserModel = Freelancer;
  } else if (obj.type === 'Client') {
    UserModel = Client;
  } else {
    return done(new Error('Unknown user type'), null);
  }

  UserModel.findById(obj.id)
    .then(user => done(null, user))
    .catch(err => done(err, null));
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Routes for Freelancers
// app.post('/login/freelancer', passport.authenticate('freelancer-local', (err, user, info) => {
//     console.log("freelancer logged in")
// }));
  
// Routes for Clients
// app.post('/login/client', passport.authenticate('client-local', {
//     successRedirect: '/dashboard/client',
//     failureRedirect: '/login/client',
// }));

app.use('/', router);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
mongoose.set("strictQuery", false);
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    server.listen(8000, () => console.log("Connected"));
  })
  .catch((error) => console.log(error));

module.exports = app;
