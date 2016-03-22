'use strict';

const bcryptService = require('../services/bcrypt.service');
const userValidation = require('./users.validation');
const authService = require('../services/auth.service');
const jwt = require('jsonwebtoken');

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
  userValidation.isValidAccount(req.body, req.models.user)
    .then(function(result) {
      if (result) {
        bcryptService.hashPassword(req.body.password).then(function(hashedPassword) {
          req.body.password = hashedPassword;
          req.models.user.create(req.body, function(err, user) {
            if (err) next(err);
            res.json({
              status: 'success'
            });
          });
        }).catch(function(err) {
          next(err);
        });
      } else {
        res.status(401).json({
          status: 'invalid account'
        });
      }
    });
}

function update(req, res, next) {
  authService.authenticateUser(req.params, req.body.currentPassword, req.models.user)
    .then(function(authenticatedUser) {
      if (authenticatedUser) {
        if (req.body.email == undefined) {
          delete req.body.email;
        }
        if (!userValidation.isValidEmail(req.body.email)) {
          res.status(401).json({
            status: 'Invalid Email'
          });
        }
        if (req.body.password == undefined) {
          delete req.body.password;
        }
        if (!userValidation.isValidPassword(req.body.password)) {
          res.status(401).json({
            status: 'Invalid Password'
          });
        }
        if (req.body.username == undefined) {
          delete req.body.username;
        }
        if (!userValidation.isValidUsername(req.body.username)) {
          res.status(401).json({
            status: 'Invalid Username'
          });
        } else {
          userValidation.isUniqueUsername(req.body.username, req.models.user)
            .then(function(result) {
              if (result) {
                if (req.body.password) {
                  bcryptService.hashPassword(req.body.password).then(function(hashedPassword) {
                    req.body.password = hashedPassword;
                    req.models.user.update({
                      id: req.params.id
                    }, req.body, function(err, user) {
                      if (err) next(err);
                      delete user.password;
                      var token = jwt.sign(user[0], 'secret', {
                        expiresIn: 60 * 60 * 5
                      });
                      res.json({
                        token: token
                      });
                    });
                  });
                } else {
                  req.models.user.update({
                    id: req.params.id
                  }, req.body, function(err, user) {
                    if (err) next(err);
                    delete user.password;
                    var token = jwt.sign(user[0], 'secret', {
                      expiresIn: 60 * 60 * 5
                    });
                    res.json({
                      token: token
                    });
                  });
                }
              } else {
                res.status(401).json({
                  status: 'Username is Taken'
                });
              }
            })
            .catch(function(err) {
              next(err);
            });
        }
      } else {
        res.status(401).json('Wrong user or password');
      }
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
  if (req.body.score === null) {
    next(new Error('Scores Cannot be null'));
  }
  req.models.saved_game.findOrCreate({
    id: req.body.saveId
  }, {
    user_id: req.params.id,
    score: req.body.score,
    saved_game: JSON.parse(req.body.save)
  }, function(err, savedGame) {
    if (err) next(err);
    req.models.user.findOne(req.params).populate('savedGames').exec(function(err, user) {
      if (err) next(err);
      var isNewGameSave = true;
      user.savedGames.forEach(function(element) {
        if (savedGame.id === element.id) {
          isNewGameSave = false;
        }
      });
      if (isNewGameSave) {
        user.savedGames.add(savedGame.id);
        user.save(function(err) {
          if (err) next(err);
          res.status(200).json({
            status: 'new game saved',
            newGameId: savedGame.id
          });
        });
      } else {
        req.models.saved_game.update({
          id: req.body.saveId
        }, {
          saved_game: JSON.parse(req.body.save)
        }, function() {
          req.models.saved_game.update({
            id: req.body.saveId,
            score: {
              '<': Number(req.body.score)
            }
          }, {
            score: req.body.score
          }, function() {
            res.status(200).json({
              status: 'game saved'
            });
          });
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
