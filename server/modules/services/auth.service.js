'use strict';

const bcryptService = require('../services/bcrypt.service');

function authenticateUser(userIdOrName, submittedPassword, userModel) {
  return new Promise(function(resolve, reject) {
    userModel.findOne(userIdOrName).exec(function(err, user) {
      if (err) reject(err);
      if (!user) {
        resolve(false);
      } else {
        bcryptService.comparePasswords(submittedPassword, user.password).then(function(result) {
          if (result) {
            resolve(user);
          } else {
            resolve(false);
          }
        });
      }
    });
  });
}

module.exports = {
  authenticateUser
};
