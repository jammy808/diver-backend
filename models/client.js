const mongoose = require('mongoose');
const plm = require('passport-local-mongoose');
  
const clientSchema = mongoose.Schema({
  profileUrl : String,
  username : String, 
  password : String,
  email : String,
  publicKey : String,
  type: { type: String, default: "Client" },
  gigs: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Gig',
    },
  ],

})

clientSchema.plugin(plm);

module.exports = mongoose.model('Client', clientSchema);
