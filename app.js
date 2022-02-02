require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { errors } = require('celebrate');
const limiter = require('./utils/limiter');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const routers = require('./routes/index');

const { PORT = 3000 } = process.env;
const app = express();

const allowedCors = [
  'https://movie-explorer.nomoredomains.work',
  'https://api.movie-explorer.nomoredomains.work',
  'http://movie-explorer.nomoredomains.work',
  'http://api.nikitas.nomoredomains.rocks',
  'http://localhost:3000/',
];

app.use((req, res, next) => {
  const { origin } = req.headers;
  const { method } = req;
  const DEFAULT_ALLOWED_METHODS = 'GET,HEAD,PUT,PATCH,POST,DELETE';
  const requestHeaders = req.headers['access-control-request-headers'];
  if (allowedCors.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', true);
  }
  if (method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', DEFAULT_ALLOWED_METHODS);
    res.header('Access-Control-Allow-Headers', requestHeaders);
    return res.end();
  }
  return next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(requestLogger);
app.use(helmet());
app.use(errorLogger);
app.use(limiter);
app.use(routers);
app.use(errors());
app.use((err, req, res, next) => {
  const status = err.statusCode || 500;
  const { message } = err;
  res.status(status).json({ message: message || 'Произошла ошибка на сервере' });
  return next();
});

mongoose.connect('mongodb://localhost:27017/moviesdb');

app.listen(PORT);
