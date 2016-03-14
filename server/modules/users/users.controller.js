'use strict';

const usersModel = require('./users.model');
usersModel.orm.initialize(usersModel.config, function(err, models) {
  if (err) {
    throw err;
  }
  usersModel.models = models.collections;
  usersModel.connections = models.connections;
});

function getAll(req, res, next) {
  usersModel.models.user.find().populate('savedGames').exec(function(err, users) {
    if (err) next(err);
    res.json(users);
  });
}
function getById(req, res, next) {
  usersModel.models.user.findOne(req.params).populate('savedGames').exec(function(err, user) {
    if (err) next(err);
    res.json(user);
  });
}
function create(req, res, next) {
  usersModel.models.user.create(req.body, function(err, user) {
    if (err) next(err);
    res.json(user);
  });
}
function update(req, res, next) {
  usersModel.models.user.update({
    id: req.params.id
  }, req.body, function(err, user) {
    if (err) next(err);
    res.json(user);
  });
}
function remove(req, res, next) {
  usersModel.models.user.destroy({
    id: req.params.id
  }, function(err) {
    if (err) next(err);
    res.json({
      status: 'success'
    });
  });
}
function saveGame(req, res, next) {
  console.log(req.params);
  usersModel.models.saved_game.create({
    user_id: req.params.id,
    saved_game: JSON.stringify(req.body.gameState)
  }, function(err, savedGame) {
    if (err) next(err);
    console.log(savedGame);
    usersModel.models.user.findOne(req.params).exec(function(err, user) {
      if (err) next(err);
      user.savedGames.add(savedGame.id);
      user.save(function(err) {
        if(err) next(err);
        res.json({status:'success'}, 200);
      });
    });
  });
}

module.exports = {
  getAll,
  create,
  getById,
  update,
  remove,
  saveGame
};
