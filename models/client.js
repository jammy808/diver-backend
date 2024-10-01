const mongoose = require('mongoose');
const plm = require('passport-local-mongoose');
  
const clientSchema = mongoose.Schema({
  username : String, 
  password : String,
  email : String,  
})

clientSchema.plugin(plm);

module.exports = mongoose.model('Client', clientSchema);
