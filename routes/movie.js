const movieRouter = require('express').Router();
const {
  getMovies,
  createMovie,
  deleteMovieById,
} = require('../controllers/movie');
const { movieValidation, idValidation } = require('../middlewares/validation');

movieRouter.get('/movies', getMovies);
movieRouter.post('/movies', movieValidation, createMovie);
movieRouter.delete('/movies/:_id', idValidation, deleteMovieById);

module.exports = movieRouter;
