'use strict';

require('dotenv').load({
  silent: true
});

var postgresqlAdapter = require('sails-postgresql');
module.exports = {
  adapters: {
    'default': postgresqlAdapter,
    postgres: postgresqlAdapter
  },
  connections: {
    myLocalPostgres: {
      adapter: 'postgres',
      url: process.env.DATABASE_URL
    }
  },
  defaults: {
    migrate: process.env.MIGRATE
  }
};
