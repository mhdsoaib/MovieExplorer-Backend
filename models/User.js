const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true } // Store plain text for now (you can hash later)
});

module.exports = mongoose.model('User', UserSchema);
