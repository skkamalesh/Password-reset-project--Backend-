const express = require('express');
const userController = require('../controller/user');
const router = express.Router();

router.post('/create-user', userController.createUser);
router.post('/login',userController.loginUser)
router.post('/forget-password', userController.forgetPassword);
router.get('/reset-password/:id/:token', userController.resetPasswordLink)
router.post('/reset-password/:id/:token', userController.resetPassword);

module.exports = router;