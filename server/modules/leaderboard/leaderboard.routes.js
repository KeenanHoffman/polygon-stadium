'use strict';

const router = require('express').Router();

const leaderboardController = require('./leaderboard.controller');

router.get('/', leaderboardController.getLeaderboard);

module.exports = router;
