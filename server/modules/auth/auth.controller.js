'use strict';

var jwt = require('jsonwebtoken');

function login(req, res, next) {
  req.models.user.findOne({
    username: req.body.username
  }).exec(function(err, user) {
    if (err) next(err);
    if (!user) {
      res.status(401).json('Wrong user or password');
    } else if(user.password === req.body.password) {
      delete user.password;
      var token = jwt.sign(user, 'secret', {
        expiresIn: 60 * 60 * 5
      });
      res.json({
        token: token
      });
    } else {
      res.status(401).json('Wrong user or password'); }
  });
}

module.exports = {
  login
};
