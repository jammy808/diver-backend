const express = require("express");
const router = express.Router();
const freelancer = require('./controllers/freelancer')
const client = require('./controllers/client')
const Message = require('./models/message');
const upload = require('./config/multer');

router.get('/' , (req , res) =>{
    res.send("hello");;
});

//Freelancer's Routes
router.post('/login/freelancer' , freelancer.loginFreelancer);
router.post("/register/freelancer", freelancer.registerFreelancer);
router.get('/getFreelancer/:freelancerId', freelancer.getSingleFreelancer);
router.get('/get/freelancers', freelancer.getFreelancers);
router.get('/invites/freelancer', freelancer.ensureAuthenticated , freelancer.getInvites );
router.post('/accept/invite' , freelancer.ensureAuthenticated ,freelancer.acceptInvite)
router.get('/browse/gigs', freelancer.getAllGigs);
router.post('/apply', freelancer.apply )
// router.get('/get/:gigId' , freelancer.getGig);

//Client's Routes
router.post('/login/client' , client.loginClient);
router.post("/register/client", client.registerClient);
router.post('/gig', client.ensureAuthenticated ,client.createGig);
router.get('/get/client', client.ensureAuthenticated, client.getClient);
router.post('/invite', client.sendInvite);
router.get('/invites/client', client.ensureAuthenticated , client.getInvites );
router.delete('/cancel-invite', client.cancelInvite);
router.get('/get/applicants', client.ensureAuthenticated, client.getApplicants);
router.post('/accept/application' , client.ensureAuthenticated , client.acceptApplication)


router.get("/profile", freelancer.ensureAuthenticated, (req, res) => {
    // Send user data as JSON
    res.status(200).json({ user: req.user });
});

router.get('/get/freelancer' , freelancer.getFreelancer);

router.get('/api/messages/:gigId', async (req, res) => {
  try {
    const messages = await Message.find({ gig: req.params.gigId }).sort('timestamp');
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

router.post('/upload', upload.single('file') , client.updateProfilePic);

router.get("/logout", client.logout);


module.exports = router;