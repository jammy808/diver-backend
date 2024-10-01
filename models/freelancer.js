const mongoose = require('mongoose');
const plm = require('passport-local-mongoose');
  
const freelancerSchema = mongoose.Schema({
  username : String, 
  password : String,
  email : String,  
})

freelancerSchema.plugin(plm);

module.exports = mongoose.model('Freelancer', freelancerSchema);
