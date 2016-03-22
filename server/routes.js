'use strict';

const router = require('express').Router();

const userRoutes = require('./modules/users/users.routes');
const authRoutes = require('./modules/auth/auth.routes');
const leaderboardRoutes = require('./modules/leaderboard/leaderboard.routes');

router.use('/users', userRoutes);
router.use('/auth', authRoutes);
router.use('/leaderboard', leaderboardRoutes);

module.exports = router;
