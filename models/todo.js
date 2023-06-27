const mongoose = require('mongoose');

// Define Schemes
const todoSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    done: { type: Boolean, default: false }
  },
  {
    timestamps: true
  });

// Create Model & Export
module.exports = mongoose.model('Todo', todoSchema);