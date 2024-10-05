const mongoose = require('mongoose');
// const plm = require('passport-local-mongoose'); // Typically not needed for non-user schemas

const gigSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      required: true,
    },

    appliedFreelancers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Freelancer',
      },
    ],

    invitedFreelancers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Freelancer',
      },
    ],

    status: {
      type: String,
      default: 'Open',
      required: true,
    },

    workingFreelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Freelancer',
      default: null,
    },

    // Info about the gig
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    budget: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

//gigSchema.plugin(plm);

module.exports = mongoose.model('Gig', gigSchema);
