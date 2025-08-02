const mongoose = require('mongoose');

const MovieSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true }, 
  title: { type: String, required: true },
  overview: String,
  release_date: String,
  vote_average: Number,
  vote_count: Number,
  popularity: Number,
  revenue: Number,
  genres: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Genre' }],
  cast: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Cast' }]
});

module.exports = mongoose.model('Movie', MovieSchema);
