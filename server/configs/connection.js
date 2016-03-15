'use strict';

var postgresqlAdapter = require('sails-postgresql');
module.exports = {
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
    migrate: 'safe'
  }
};
