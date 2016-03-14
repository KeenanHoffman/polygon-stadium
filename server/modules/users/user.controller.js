'use strict';

// const userModel = require('./user.model');
// const userValidation = require('./user.validation');

function user(req, res, next) {
  res.json('user');
}

module.exports = {
	user,
};
