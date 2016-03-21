'use strict';

const jwt = require('jsonwebtoken');
const authService = require('../services/auth.service');

function login(req, res, next) {
  authService.authenticateUser({
      username: req.body.username
    }, req.body.password, req.models.user)
    .then(function(authenticatedUser) {
      if (authenticatedUser) {
        delete authenticatedUser.password;
        var token = jwt.sign(authenticatedUser, 'secret', {
          expiresIn: 60 * 60 * 5
        });
        res.json({
          token: token
        });
      } else {
        res.status(401).json('Wrong user or password');
      }
    }).catch(function(err) {
      next(err);
    });
  // req.models.user.findOne({
  //   username: req.body.username
  // }).exec(function(err, user) {
  //   if (err) next(err);
  //   if (!user) {
  //     res.status(401).json('Wrong user or password');
  //   } else {
  //     // bcryptService.comparePasswords(req.body.password, user.password)
  //
  //     .then(function(result) {
  //       if (result) {
  //         delete user.password;
  //         var token = jwt.sign(user, 'secret', {
  //           expiresIn: 60 * 60 * 5
  //         });
  //         res.json({
  //           token: token
  //         });
  //       } else {
  //         res.status(401).json('Wrong user or password');
  //       }
  //     });
  //   }
  // });
}

module.exports = {
  login
};
