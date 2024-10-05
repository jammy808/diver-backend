const mongoose = require('mongoose');
const plm = require('passport-local-mongoose');
  
const clientSchema = mongoose.Schema({
  username : String, 
  password : String,
  email : String,
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
