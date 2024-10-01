const clientModel = require('../models/client');
const passport = require("passport");
const localStratergy = require("passport-local");
passport.use(new localStratergy(clientModel.authenticate()));

exports.loginClient = (req, res, next) => {
  passport.authenticate("client-local", (err, user, info) => {
    if (err) {
      return res.status(500).json({
        message: "An error occurred during authentication.",
        error: err,
      });
    }
    if (!user) {
      return res.status(401).json({ message: "Invalid username or password." });
    }
    req.logIn(user, (err) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Failed to log in user.", error: err });
      }
      return res.status(200).json({ message: "Login successful", user: user });
    });
  })(req, res, next);
};

exports.registerClient = async (req, res, next) => {
    var clientData = new clientModel({
      username: req.body.username,
      email: req.body.email,
    });
  
    clientModel
      .register(clientData, req.body.password)
      .then((result) => {
  
        passport.authenticate("client-local")(req, res, async function () {
          console.log("client registered")
        });
      })
      .catch(next);
};