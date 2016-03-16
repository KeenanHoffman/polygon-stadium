'use strict';

function getAll(req, res, next) {
  req.models.user.find().populate('savedGames').exec(function(err, users) {
    if (err) next(err);
    res.json(users);
  });
}
function getById(req, res, next) {
  req.models.user.findOne(req.params).populate('savedGames').exec(function(err, user) {
    if (err) next(err);
    res.json(user);
  });
}
function create(req, res, next) {
  req.models.user.create(req.body, function(err, user) {
    if (err) next(err);
    res.json(user);
  });
}
function update(req, res, next) {
  req.models.user.update({
    id: req.params.id
  }, req.body, function(err, user) {
    if (err) next(err);
    res.json(user);
  });
}
function remove(req, res, next) {
  req.models.user.destroy({
    id: req.params.id
  }, function(err) {
    if (err) next(err);
    res.json({
      status: 'success'
    });
  });
}
function saveGame(req, res, next) {
  req.models.saved_game.create({
    user_id: req.params.id,
    saved_game: req.body.gameState
  }, function(err, savedGame) {
    if (err) next(err);
    req.models.user.findOne(req.params).populate('savedGames').exec(function(err, user) {
      if (err) next(err);
      user.savedGames.add(savedGame.id);
      user.save(function(err) {
        if(err) next(err);
        res.status(200).json({status:'success'});
      });
    });
  });
}
function getSaves(req, res, next) {
  req.models.user.findOne(req.params).populate('savedGames').exec(function(err, user) {
    if (err) next(err);
    res.json(user.savedGames);
  });
}

module.exports = {
  getAll,
  create,
  getById,
  update,
  remove,
  saveGame,
  getSaves
};
