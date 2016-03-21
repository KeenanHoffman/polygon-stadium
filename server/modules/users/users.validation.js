'use strict';

const iz = require('iz');

function isValidAccount(newUser, userModel) {
  return new Promise(function(resolve, reject) {
    if (!isValidUsername(newUser.username)) resolve(false);
    if (!isValidEmail(newUser.email)) resolve(false);
    if (!isValidPassword(newUser.password)) resolve(false);
    isUniqueUsername(newUser.username, userModel).then(function(result) {
        resolve(result);
      })
      .catch(function(err) {
        reject(err);
      });
  });
}

function isValidUsername(username) {
  return (iz.alphaNumeric(username) && iz.minLength(username, 4) && iz.maxLength(username, 16));
}

function isValidPassword(password) {
  return (iz.minLength(password, 8) && iz.maxLength(password, 24));
}

function isValidEmail(email) {
  return iz.email(email);
}

function isUniqueUsername(username, userModel) {
  return new Promise(function(resolve, reject) {
    userModel.findOne({
        username: username
      })
      .exec(function(err, user) {
        if (err) reject(err);
        if (user) {
          resolve(false);
        } else {
          resolve(true);
        }
      });
  });
}
module.exports = {
  isValidAccount,
  isValidUsername,
  isValidPassword,
  isValidEmail,
  isUniqueUsername
};
