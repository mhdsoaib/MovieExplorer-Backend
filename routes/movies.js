const express = require('express');
const router = express.Router();
const Movie = require('../models/Movie');
const Cast = require('../models/Cast');
const Genre = require('../models/Genre');
const mongoose = require('mongoose');
const authenticateToken = require('../middleware/auth');


router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      year,
      genres,          
      without_genres,  
      sortBy = 'popularity',
      order = 'desc',
      search
    } = req.query;

    const filter = {};

    // Filter by year (release_date starts with year)
    if (year) {
      filter.release_date = { $regex: `^${year}` };
    }

    // Filter by genres (include)
    if (genres) {
      const genreIds = genres.split(',').map(id => new mongoose.Types.ObjectId(id));
      filter.genres = { $all: genreIds };
    }

    // Filter by without_genres (exclude)
    if (without_genres) {
      const withoutGenreIds = without_genres.split(',').map(id => mongoose.Types.ObjectId(id));
      filter.genres = { $nin: withoutGenreIds };
    }

    // Search by title or cast name
    if (search) {
      // Find movie IDs where cast name matches search
      const castMovies = await Cast.find({ name: { $regex: search, $options: 'i' } }).distinct('movie');

      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { _id: { $in: castMovies } }
      ];
    }

    // Allowed sort fields list
    const allowedSortFields = [
      'popularity', 'vote_average', 'vote_count', 'release_date', 'revenue', 'title'
    ];

    // Validate sortBy field
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'popularity';

    const sortOrder = order.toLowerCase() === 'asc' ? 1 : -1;
    const sortObj = {};
    sortObj[sortField] = sortOrder;

    const skip = (page - 1) * limit;
    const limitNum = parseInt(limit);

    const movies = await Movie.find(filter)
      .populate('genres')
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum);

    const total = await Movie.countDocuments(filter);

    res.json({
      page: parseInt(page),
      totalPages: Math.ceil(total / limitNum),
      totalResults: total,
      results: movies
    });

  } catch (error) {
    console.error('Error fetching movies:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /movies/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const movie = await Movie.findById(id)
      .populate('genres')
      .lean(); 

    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    // Get cast for the movie
    const cast = await Cast.find({ movie: id });

    res.json({ ...movie, cast });
  } catch (error) {
    console.error('Error fetching movie:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/add', authenticateToken, async (req, res) => {});


module.exports = router;
