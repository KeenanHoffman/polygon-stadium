'use strict';

const router = require('express').Router();

const userRoutes = require('./modules/users/user.routes');

router.use('/user', userRoutes);

module.exports = router;
