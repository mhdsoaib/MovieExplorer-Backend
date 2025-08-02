// routes/cast.js
const express = require('express');
const router = express.Router();
const Cast = require('../models/Cast');

router.get('/:movieId', async (req, res) => {
  try {
    const { movieId } = req.params;
    const cast = await Cast.find({ movie: movieId });
    res.json(cast);
  } catch (err) {
    console.error('Error fetching cast:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
