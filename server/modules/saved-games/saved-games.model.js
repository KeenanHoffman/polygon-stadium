'use strict';

const Waterline = require('waterline');

module.exports = Waterline.Collection.extend({
  identity: 'saved_game',
  connection: 'myLocalPostgres',
  attributes: {
    user_id: 'integer',
    saved_game: 'string',
    player: {
      collection: 'user',
      via: 'savedGames'
    }
  }
});
