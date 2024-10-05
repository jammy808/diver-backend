const mongoose = require('mongoose');
const plm = require('passport-local-mongoose');
  
const freelancerSchema = mongoose.Schema({
  username : String, 
  password : String,
  email : String,
  type: { type: String, default: "Freelancer" },    
  invites: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Gig',
    },
  ],
  gigs: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Gig',
    },
  ],
  applied: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Gig',
    },
  ],
})

freelancerSchema.plugin(plm);

module.exports = mongoose.model('Freelancer', freelancerSchema);
