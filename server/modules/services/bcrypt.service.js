'use strict';

const bcrypt = require('bcrypt');

function hashPassword(password) {
  return new Promise(function(resolve, reject) {
    bcrypt.genSalt(10, function(err, salt) {
      if (err) reject(err);
      bcrypt.hash(password, salt, function(err, hash) {
        if (err) reject(err);
        resolve(hash);
      });
    });
  });
}

function comparePasswords(submittedPassword, userPassword) {
  return new Promise(function(resolve, reject) {
    bcrypt.compare(submittedPassword, userPassword, function(err, result) {
      if (err) reject(err);
      resolve(result);
    });
  });
}

module.exports = {
  hashPassword,
  comparePasswords
};
