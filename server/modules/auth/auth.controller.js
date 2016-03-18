'use strict';

const jwt = require('jsonwebtoken');
const bcryptService = require('../services/bcrypt.service');

function login(req, res, next) {
  req.models.user.findOne({
    username: req.body.username
  }).exec(function(err, user) {
    if (err) next(err);
    if (!user) {
      res.status(401).json('Wrong user or password');
    } else {
      bcryptService.comparePasswords(req.body.password, user.password).then(function(result) {
        if (result) {
          delete user.password;
          var token = jwt.sign(user, 'secret', {
            expiresIn: 60 * 60 * 5
          });
          res.json({
            token: token
          });
        } else {
          res.status(401).json('Wrong user or password');
        }
      });
    }

  });
}

module.exports = {
  login
};
