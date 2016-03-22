'use strict';

function getLeaderboard(req, res, next) {
  req.models.saved_game.find().sort('score DESC').limit(10).populate('player').exec(function(err, scores) {
    if (err) next(err);
    scores.forEach(function(score) {
      delete score.player[0].password;
      delete score.player[0].email;
      delete score.user_id;
    });
    res.send(scores);
  });
}

module.exports = {
  getLeaderboard
};
