const mongoose = require('mongoose');

// Define Schemes
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    nickName: { type: String, required: true },
    method: { type: String, required: true },
    profileUrl:{type: String, required: false},
    profileContent:{type: String, required: false},
  },
  {
    timestamps: true
  });

// Create Model & Export
module.exports = mongoose.model('User', userSchema,'user');