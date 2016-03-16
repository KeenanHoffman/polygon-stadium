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
  // console.log(JSON.parse(req.body.save));
  req.models.saved_game.findOrCreate({
    id: req.body.saveId
  }, {
    user_id: req.params.id,
    saved_game: JSON.parse(req.body.save)
  }, function(err, savedGame) {
    if (err) next(err);
    req.models.user.findOne(req.params).populate('savedGames').exec(function(err, user) {
      if (err) next(err);
      var isNewGameSave = true;
      user.savedGames.forEach(function(element) {
        // console.log(savedGame.id, user.savedGames);
        if(savedGame.id === element.id) {
          isNewGameSave = false;
        }
      });
      if(isNewGameSave) {
        user.savedGames.add(savedGame.id);
        user.save(function(err) {
          if(err) next(err);
          res.status(200).json({status:'new game saved', newGameId: savedGame.id});
        });
      } else {
        req.models.saved_game.update({
          id: req.body.saveId
        }, {
          saved_game: JSON.parse(req.body.save)
        }, function() {
          res.status(200).json({status:'game saved'});
        });
      }
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
