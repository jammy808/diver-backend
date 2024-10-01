const express = require("express");
const router = express.Router();
const freelancer = require('./controllers/freelancer')
const client = require('./controllers/client')

router.get('/' , (req , res) =>{
    res.send("hello");;
});

router.post('/login/freelancer' , freelancer.loginFreelancer);
router.post("/register/freelancer", freelancer.registerFreelancer);

router.post('/login/client' , client.loginClient);
router.post("/register/client", client.registerClient);


module.exports = router;