'use strict';

const router = require('express').Router();

const userRoutes = require('./modules/users/users.routes');
const authRoutes = require('./modules/auth/auth.routes');

router.use('/users', userRoutes);
router.use('/auth', authRoutes);

module.exports = router;
