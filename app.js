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

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(
    cors({
      origin: "http://localhost:5173",
      credentials: true, // Allow credentials (cookies) to be sent
    })
  );

app.use(expressSession({
  resave : false,
  saveUninitialized : false,
  secret : "yoyo whatup"
}))

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
    app.listen(8000, () => console.log("Connected"));
  })
  .catch((error) => console.log(error));

module.exports = app;
