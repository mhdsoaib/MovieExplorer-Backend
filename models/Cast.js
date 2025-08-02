const mongoose = require('mongoose');

const CastSchema = new mongoose.Schema({
  id: { type: Number, required: true }, 
  name: { type: String, required: true },
  character: { type: String },
  movie: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }
});

module.exports = mongoose.model('Cast', CastSchema);
