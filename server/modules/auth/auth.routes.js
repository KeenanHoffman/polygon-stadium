'use strict';

const router = require('express').Router();

const authController = require('./auth.controller');

router.post('/', authController.login);

module.exports = router;
