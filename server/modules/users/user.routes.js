'use strict';

const router = require('express').Router();

const userController = require('./user.controller');

router.get('/', userController.user);
// router.get('/user', authController.isAuthenticated, userController.getAll);
// router.get('/user/:id', authController.isAuthenticated, userController.getById);
// router.post('/user/', userController.create);
// router.put('/user/:id', authController.isAuthenticated, authController.isAuthorized,  userController.update);
// router.delete('/user', authController.isAuthenticated, authController.isAuthorized,  userController.remove);

module.exports = router;
