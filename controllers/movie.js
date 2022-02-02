const Movie = require('../models/movie');
const Forbidden = require('../errors/Forbidden');
const NotFoundError = require('../errors/NotFoundError');
const WrongData = require('../errors/WrongData');
const DefaultError = require('../errors/DefaultError');

const getMovies = (req, res, next) => {
  Movie.find({})
    .then((movie) => res.send({ data: movie }))
    .catch(() => {
      throw new DefaultError('Произошла ошибка');
    })
    .catch(next);
};

const createMovie = (req, res, next) => {
  const {
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    thumbnail,
    nameRU,
    movieId,
    nameEN,
  } = req.body;
  const owner = req.user._id;
  Movie.create({
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    thumbnail,
    nameRU,
    nameEN,
    movieId,
    owner,
  })
    .then((movie) => res.send({ data: movie }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new WrongData('Переданы неверные данные.');
      } else {
        throw new DefaultError('Произошла ошибка');
      }
    })
    .catch(next);
};

const deleteMovieById = (req, res, next) => {
  Movie.findById(req.params._id)
    .orFail(new NotFoundError('Фильм не найден'))
    .then((movies) => {
      if (req.user._id === movies.owner.toString()) {
        Movie.findByIdAndRemove(req.params._id).then((movie) => {
          res.send({ data: movie });
        });
      } else {
        throw new Forbidden('Нельзя удалить чужой фильм.');
      }
    })
    .catch(next);
};
module.exports = { getMovies, createMovie, deleteMovieById };
