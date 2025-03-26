const clientModel = require('../models/client');
const freelancerModel = require('../models/freelancer');
const gigModel = require('../models/gig')
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
      publicKey: req.body.publicKey,
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

exports.ensureAuthenticated = (req, res, next) => {
  //console.log(req.user);
  console.log('Session:', req.session);
  console.log('User:', req.user);
  console.log('Authenticated:', req.isAuthenticated());
  
  if (req.isAuthenticated()) {
    return next();
  }
  res
    .status(401)
    .json({ message: "You are not authenticated. Please log in." });
};

exports.getSingleFreelancer = async (req, res) => {
  const { freelancerId } = req.params; // Get freelancerId from request body

  try {
    const freelancer = await freelancerModel.findById(freelancerId);

    if (!freelancer) {
      return res.status(404).json({ message: 'Freelancer not found' });
    }

    res.status(200).json(freelancer); // Send freelancer data
  } catch (error) {
    console.error('Error fetching freelancer:', error);
    res.status(500).json({ message: 'Server error' });
  }
}

exports.getFreelancers = async (req, res) => {
  try {
    const freelancers = await freelancerModel.find();
    res.json(freelancers);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
}

exports.getInvites = async (req, res) => {
  try {
    console.log(req.user._id);
    const freelancer = await freelancerModel.findById(req.user._id)
      .populate({
        path: 'invites',
        populate: {
          path: 'client', // Populate invitedFreelancers inside each gig
          model: 'Client',
        }
      });

    if (!freelancer) {
      return res.status(404).json({ message: 'freelancer not found' });
    }

    // Send the populated gigs array in the response
    res.status(200).json({
      gigs: freelancer.invites
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error });
  }
}

exports.acceptInvite = async (req, res) => {
  const { gigId } = req.body;
  const freelancerId = req.user._id;
  
  try {
    const gig = await gigModel.findById(gigId);
    if (!gig) {
      return res.status(404).json({ message: 'Gig not found' });
    }

    gig.invitedFreelancers = gig.invitedFreelancers.filter(
      (freelancerObjId) => freelancerObjId.toString() !== freelancerId.toString()
    );

    gig.workingFreelancer = freelancerId;
    await gig.save();

    const freelancer = await freelancerModel.findById(freelancerId);
    if (!freelancer) {
      return res.status(404).json({ message: 'Freelancer not found' });
    }

    freelancer.invites = freelancer.invites.filter(
      (inviteGigId) => inviteGigId.toString() !== gigId
    );
    freelancer.gigs.push(gigId);
    await freelancer.save();

    res.status(200).json({
      message: 'Gig is accpeted',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
}

exports.getAllGigs = async (req, res) => {
  try {
    const gigs = await gigModel.find()
      .populate('client', 'username') // Populate client's username
      .populate('appliedFreelancers') // Populate applied freelancers
      .populate('invitedFreelancers'); // Populate invited freelancers

    res.status(200).json(gigs);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving gigs', error: err.message });
  }
}

exports.apply = async (req, res) => { 
  try {
    const { gigId, freelancerId } = req.body;

    const gig = await gigModel.findById(gigId);
    const freelancer = await freelancerModel.findById(freelancerId);

    if (!gig) {
      return res.status(404).json({ message: 'Gig not found' });
    }

    if (!freelancer) {
      return res.status(404).json({ message: 'Freelancer not found' });
    }

    freelancer.applied.push(gigId);
    await freelancer.save();

    gig.appliedFreelancers.push(freelancerId);
    await gig.save();

    res.status(201).json({
      message: 'applied successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getFreelancer = async (req, res) => {
  const id  = req.user._id;

  try {
    const freelancer = await freelancerModel
      .findById(id)
      .populate('applied')    
      .populate('invites')      
      .populate('gigs');

    if (!freelancer) {
      return res.status(404).json({ message: 'Freelancer not found' });
    }

    res.status(200).json(freelancer);
  } catch (error) {
    console.error('Error fetching freelancer:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// exports.getGig = async (req, res) => {
//   const { gigId } = req.params;

//   try {
//     const gig = await gigModel.findById(gigId)
//     .populate('client', 'username') // Populate client's username
//     .populate('appliedFreelancers') // Populate applied freelancers
//     .populate('invitedFreelancers'); // Populate invited freelancers


//     if (!gig) {
//       return res.status(404).json({ message: 'gig not found' });
//     }

//     res.status(200).json(gig);
//   } catch (error) {
//     console.error('Error fetching gig:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// }