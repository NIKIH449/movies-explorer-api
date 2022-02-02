const userRouter = require('express').Router();
const { updateUser, getUser } = require('../controllers/user');
const { userInfoValidation } = require('../middlewares/validation');

userRouter.get('/users/me', getUser);
userRouter.patch('/users/me', userInfoValidation, updateUser);

module.exports = userRouter;
