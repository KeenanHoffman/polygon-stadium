'use strict';

const Waterline = require('waterline');
var orm = new Waterline();

var postgresqlAdapter = require('sails-postgresql');
var config = {
  adapters: {
    'default': postgresqlAdapter,
    postgres: postgresqlAdapter
  },
  connections: {
    myLocalPostgres: {
      adapter: 'postgres',
      host: 'localhost',
      database: 'polygon_stadium'
    }
  },
  defaults: {
    migrate: 'alter'
  }
};

var User = Waterline.Collection.extend({
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

var SavedGame = Waterline.Collection.extend({
  identity: 'saved_game',
  connection: 'myLocalPostgres',
  attributes: {
    user_id: 'string',
    saved_game: 'json',
    player: {
      collection: 'user',
      via: 'savedGames'
    }
  }
});

orm.loadCollection(User);
orm.loadCollection(SavedGame);

module.exports = {
  orm,
  config
};
