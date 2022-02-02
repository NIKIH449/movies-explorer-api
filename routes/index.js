const routers = require('express').Router();
const userRouter = require('./user');
const movieRouter = require('./movie');
const auth = require('../middlewares/auth');
const { login, createUser, logout } = require('../controllers/user');
const { loginValidation, createUserValidation } = require('../middlewares/validation');
const NotFoundError = require('../errors/NotFoundError');

routers.post('/signin', loginValidation, login);
routers.post('/signup', createUserValidation, createUser);
routers.post('/signout', logout);
routers.use(auth);
routers.use('/', userRouter);
routers.use('/', movieRouter);
routers.use('*', () => {
  throw new NotFoundError('Такой страницы не существует.');
});

module.exports = routers;
