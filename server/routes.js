'use strict';

const router = require('express').Router();

const userRoutes = require('./modules/users/users.routes');

router.use('/users', userRoutes);

module.exports = router;
