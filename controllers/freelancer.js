const freelancerModel = require('../models/freelancer');
const passport = require("passport");
const localStratergy = require("passport-local");
passport.use(new localStratergy(freelancerModel.authenticate()));

exports.loginFreelancer = (req, res, next) => {
  passport.authenticate("freelancer-local", (err, user, info) => {
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

exports.registerFreelancer = async (req, res, next) => {
    var freelancerData = new freelancerModel({
      username: req.body.username,
      email: req.body.email,
    });
  
    freelancerModel
      .register(freelancerData, req.body.password)
      .then((result) => {
  
        passport.authenticate("freelancer-local")(req, res, async function () {
          console.log("freelancer registered")
        });
      })
      .catch(next);
};