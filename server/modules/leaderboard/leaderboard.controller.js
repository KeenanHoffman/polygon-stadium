'use strict';

function getLeaderboard(req, res, next) {
  req.models.saved_game.find().sort('score DESC').limit(10).populate('player').exec(function(err, scores) {
    if (err) next(err); else 
    if (scores) {
      scores.forEach(function(score) {
        delete score.player[0].password;
        delete score.player[0].email;
        delete score.user_id;
      });
      res.json(scores);
    } else {
      res.json({
        status: 'no scores where found'
      });
    }
  });
}

module.exports = {
  getLeaderboard
};
