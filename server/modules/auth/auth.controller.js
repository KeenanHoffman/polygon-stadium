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
        var token = jwt.sign(authenticatedUser, process.env.SECRET, {
          expiresIn: 60 * 60 * 5
        });
        res.json({
          token: token
        });
      } else {
        res.status(401).json({
          status: 'Username and Password Do Not Match'
        });
      }
    }).catch(function(err) {
      next(err);
    });
}

module.exports = {
  login
};
