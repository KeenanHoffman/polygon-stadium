'use strict';

const Waterline = require('waterline');
var orm = new Waterline();

// get connection configs
const connectionConfig = require('../configs/connection.js');

// load model definitions
var User = require('../modules/users/users.model.js');
const SavedGame = require('../modules/saved-games/saved-games.model.js');

// load models into orm
orm.loadCollection(User);
orm.loadCollection(SavedGame);

// initialize function
function initialize(app, PORT, callback) {
    // Initialize the whole database and store models and connections to app
    orm.initialize(connectionConfig, function(err, models) {
      if(err) throw err;
      // pass the collections (models) and connections created to app
      callback(models.collections, models.connections);
    });
}
module.exports = {
  initialize
};
