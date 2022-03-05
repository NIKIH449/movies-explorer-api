const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const NotFoundError = require('../errors/NotFoundError');
const WrongData = require('../errors/WrongData');
const SameEmail = require('../errors/SameEmail');

const { NODE_ENV, JWT_SECRET } = process.env;

const createUser = (req, res, next) => {
  const { name, email } = req.body;
  bcrypt
    .hash(req.body.password, 10)
    .then((hash) => User.create({
      name,
      email,
      password: hash,
    }))
    .then(() => res.status(200).send({
      data: {
        name,
        email,
      },
    }))
    .catch((err) => {
      if (err.code === 11000) {
        throw new SameEmail('Такой пользователь уже существует.');
      } else if (err.name === 'ValidationError') {
        throw new WrongData('Переданы некорректные данные.');
      } else {
        next(err);
      }
    })
    .catch(next);
};

const login = (req, res, next) => {
  const { email, password } = req.body;
  User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign(
        { _id: user._id },
        NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret',
        { expiresIn: '7d' },
      );
      return res
        .cookie('token', token, {
          maxAge: 3600000 * 24 * 7,
          httpOnly: true,
          sameSite: 'None',
          secure: true,
        })
        .send({ token });
    })
    .catch(next);
};

const updateUser = (req, res, next) => {
  const owner = req.user._id;
  const { email, name } = req.body;

  User.findByIdAndUpdate(
    owner,
    { name, email },
    { new: true, runValidators: true },
  )
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Произошла ошибка');
      } else {
        res.send({ data: { email: user.email, name: user.name } });
      }
    })
    .catch((err) => {
      if (err.code === 11000) {
        throw new SameEmail('Такой пользователь уже существует.');
      } else
      if (err.name === 'ValidationError') {
        throw new NotFoundError('Данные пользователя не найдены.');
      } else {
        next(err);
      }
    })
    .catch(next);
};

const getUser = (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => res.send({ user: { name: user.name, email: user.email } }))
    .catch(() => {
      throw new NotFoundError('Данные пользователя не найдены.');
    })
    .catch(next);
};

const logout = (req, res) => res.clearCookie('token')
  .status(200).send();

module.exports = {
  createUser, login, updateUser, getUser, logout,
};
