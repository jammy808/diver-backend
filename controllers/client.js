const clientModel = require('../models/client');
const freelancerModel = require('../models/freelancer');
const gigModel = require('../models/gig')
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
      publicKey: req.body.publicKey,
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

exports.ensureAuthenticated = (req, res, next) => {
  console.log(req.user);
  if (req.isAuthenticated()) {
    return next();
  }
  res
    .status(401)
    .json({ message: "You are not authenticated. Please log in." });
};

exports.ensureClient = (req, res, next) => {
  if (req.user && req.user.type === 'Client') {
    return next();
  }
  res.status(403).json({ message: 'Forbidden: Access is allowed only for clients.' });
};

exports.createGig = async (req, res) => {
  try {
  
    const { title, description, budget} = req.body;
    
    if (!title || !description || !budget) {
      return res.status(400).json({ message: 'All fields are required: title, description, budget, deadline.' });
    }

    if (typeof budget !== 'number' || budget < 0) {
      return res.status(400).json({ message: 'Budget must be a positive number.' });
    }

    
    const newGig = new gigModel({
      client: req.user._id, // chjange  this
      title,
      description,
      budget,
    });

    // Save to Database
    const savedGig = await newGig.save();

    const client = await clientModel.findById(savedGig.client);

    if (client) {
      client.gigs.push(savedGig._id); // Add the gig ID to the client's gigs array

      // Save the updated client instance
      await client.save();

      console.log('Gig saved and added to client\'s gigs array successfully!');
    } else {
      console.log('Client not found.');
    }

    res.status(201).json({
      message: 'Gig created successfully.',
      gig: savedGig,
    });
  } catch (error) {
    console.error('Error creating gig:', error);
    res.status(500).json({ message: 'Server error while creating gig.' });
  }
}

exports.getClient = async (req, res) => {
  try {
    const clientId = req.user._id;
    
    const client = await clientModel.findById(clientId)
    .populate({
      path: 'gigs',
      populate: {
        path: 'workingFreelancer',
        model: 'Freelancer',
      }
    });
    
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    res.status(200).json(client);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
}

exports.sendInvite = async (req, res) => { 
  try {
    // Assuming gigId and freelancerId are passed in the request body
    const { gigId, freelancerId } = req.body; // Extract gigId and freelancerId from the request body

    // Find the gig and freelancer by their IDs
    const gig = await gigModel.findById(gigId);
    const freelancer = await freelancerModel.findById(freelancerId);
    //console.log(freelancerId);

    // Check if gig and freelancer exist
    if (!gig) {
      return res.status(404).json({ message: 'Gig not found' });
    }

    if (!freelancer) {
      return res.status(404).json({ message: 'Freelancer not found' });
    }

    // Add invite to the freelancer's invites array
    freelancer.invites.push(gigId); // Assuming req._id is the invite ID or sender's ID
    await freelancer.save();

    // Add the freelancer to the gig's invitedFreelancers array
    gig.invitedFreelancers.push(freelancerId);
    await gig.save(); // Don't forget to save the gig after modifying it

    // Send a response indicating success
    res.status(201).json({
      message: 'Invite sent',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getInvites = async (req, res) => {
  try {
    console.log(req.user._id);
    const client = await clientModel.findById(req.user._id)
      .populate({
        path: 'gigs',
        populate: {
          path: 'invitedFreelancers', // Populate invitedFreelancers inside each gig
          model: 'Freelancer',
        }
      });

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    // Send the populated gigs array in the response
    res.status(200).json({
      gigs: client.gigs
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error });
  }
}

exports.cancelInvite = async (req, res) => {
  const { gigId, freelancerId } = req.body;

  try {
    const gig = await gigModel.findById(gigId);
    if (!gig) {
      return res.status(404).json({ message: 'Gig not found' });
    }

    gig.invitedFreelancers = gig.invitedFreelancers.filter(
      (freelancerObjId) => freelancerObjId.toString() !== freelancerId
    );
    await gig.save();

    const freelancer = await freelancerModel.findById(freelancerId);
    if (!freelancer) {
      return res.status(404).json({ message: 'Freelancer not found' });
    }

    freelancer.invites = freelancer.invites.filter(
      (inviteGigId) => inviteGigId.toString() !== gigId
    );
    await freelancer.save();

    res.status(200).json({
      message: 'Freelancer removed from gig invites and gig removed from freelancer invites',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
}

exports.getApplicants = async (req, res) => {
  try {
    console.log(req.user._id);
    const client = await clientModel.findById(req.user._id)
      .populate({
        path: 'gigs',
        populate: {
          path: 'appliedFreelancers',
          model: 'Freelancer',
        }
      });

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    // Send the populated gigs array in the response
    res.status(200).json({
      gigs: client.gigs
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error });
  }
}

exports.acceptApplication = async (req, res) => {
  const { gigId , freelancerId } = req.body;
  
  try {
    const gig = await gigModel.findById(gigId);
    if (!gig) {
      return res.status(404).json({ message: 'Gig not found' });
    }

    gig.appliedFreelancers = gig.appliedFreelancers.filter(
      (freelancerObjId) => freelancerObjId.toString() !== freelancerId //
    );

    gig.workingFreelancer = freelancerId;
    gig.status = "Ongoing";
    await gig.save();

    const freelancer = await freelancerModel.findById(freelancerId);
    if (!freelancer) {
      return res.status(404).json({ message: 'Freelancer not found' });
    }

    freelancer.applied = freelancer.applied.filter(
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
