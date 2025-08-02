// routes/genres.js
const express = require('express');
const router = express.Router();
const Genre = require('../models/Genre');

router.get('/', async (req, res) => {
  try {
    const genres = await Genre.find().sort({ name: 1 }); 
    res.json(genres);
  } catch (err) {
    console.error('Error fetching genres:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
