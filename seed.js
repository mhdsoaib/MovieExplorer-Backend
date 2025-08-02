const mongoose = require('mongoose');
const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

const Movie = require('./models/Movie');
const Genre = require('./models/Genre');
const Cast = require('./models/Cast');
const { fetchWithFallback } = require('./utils/tmdbFetch'); 

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected for seeding...'))
  .catch((err) => console.error(err));

const api = axios.create({
  baseURL: 'https://api.themoviedb.org/3',
  headers: {
    Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}`
  }
});

const seedMovies = async () => {
  try {
    const test = await fetchWithFallback(() => api.get('/movie/550'), './fallback/fallback.json');
    console.log('✅ TMDB test result:', test.title);

    for (let page = 1; page <= 25; page++) {
      const discoverRes = await fetchWithFallback(
        () => api.get(`/discover/movie?page=${page}`),
        `./fallback/discover_page_${page}.json`
      );
      const movies = discoverRes.results;

      for (const movie of movies) {
        const movieId = movie.id;

        if (await Movie.findOne({ id: movieId })) continue;

        const movieDetails = await fetchWithFallback(
          () => api.get(`/movie/${movieId}`),
          `./fallback/movie_${movieId}.json`
        );

        const credits = await fetchWithFallback(
          () => api.get(`/movie/${movieId}/credits`),
          `./fallback/credits_${movieId}.json`
        );

        const castList = credits.cast.slice(0, 5);
        const genreIds = [];

        for (const genre of movieDetails.genres) {
          let dbGenre = await Genre.findOne({ id: genre.id });
          if (!dbGenre) {
            dbGenre = await Genre.create({ id: genre.id, name: genre.name });
          }
          genreIds.push(dbGenre._id);
        }

        const newMovie = await Movie.create({
          id: movieDetails.id,
          title: movieDetails.title,
          overview: movieDetails.overview,
          release_date: movieDetails.release_date,
          vote_average: movieDetails.vote_average,
          vote_count: movieDetails.vote_count,
          popularity: movieDetails.popularity,
          revenue: movieDetails.revenue,
          genres: genreIds,
          cast: []
        });

        for (const person of castList) {
          const savedCast = await Cast.create({
            id: person.id,
            name: person.name,
            character: person.character,
            movie: newMovie._id
          });
          newMovie.cast.push(savedCast._id);
        }

        await newMovie.save();
        console.log(`✅ Saved movie: ${movieDetails.title}`);
      }
    }

    console.log('🎉 Seeding completed.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding error:', err.stack || err);
    process.exit(1);
  }
};

seedMovies();
