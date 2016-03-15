'use strict';

const Waterline = require('waterline');

module.exports = Waterline.Collection.extend({
  identity: 'user',
  connection: 'myLocalPostgres',
  attributes: {
    username: 'string',
    email: 'string',
    password: 'string',
    savedGames: {
      collection: 'saved_game',
      via: 'player',
      dominant: true
    }
  }
});
