const Movie = require("../models/movie");
const Forbidden = require("../errors/Forbidden");
const NotFoundError = require("../errors/NotFoundError");
const WrongData = require("../errors/WrongData");

const getMovies = (req, res, next) => {
  Movie.find({ owner: req.user._id })
    .then((movie) => res.send({ data: movie }))
    .catch((err) => {
      next(err);
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
    trailer,
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
    trailer,
    thumbnail,
    nameRU,
    nameEN,
    movieId,
    owner,
  })

    .then((movie) => res.send({ data: movie }))
    .catch((err) => {
      if (err.name === "ValidationError") {
        throw new WrongData("Переданы неверные данные.");
      } else {
        next(err);
      }
    })
    .catch(next);
};

const deleteMovieById = (req, res, next) => {
  Movie.findById(req.params._id)
    .orFail(new NotFoundError("Фильм не найден"))
    .then((movie) => {
      if (req.user._id === movie.owner.toString()) {
        return movie
          .remove()
          .then(() => res.status(200).send({ message: "Фильм удалён" }));
      }
      throw new Forbidden("Нельзя удалить чужой фильм.");
    })
    .catch(next);
};
module.exports = { getMovies, createMovie, deleteMovieById };
