const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const movieRoutes = require('./routes/movies');
const genreRoutes = require('./routes/genres');
const castRoutes = require('./routes/cast');
const authRoutes = require('./routes/auth');



dotenv.config();
const app = express();

app.use(express.json());
app.use(cors());
app.use('/movies', movieRoutes);
app.use('/genres', genreRoutes);
app.use('/cast', castRoutes);
app.use('/auth', authRoutes);



// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB connected'))
.catch((err) => console.error('❌ Mongo Error:', err));


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
