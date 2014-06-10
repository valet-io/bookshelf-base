'use strict';

var Bookshelf = require('bookshelf');
var knex      = require('knex');

module.exports = Bookshelf
  .initialize(knex({
    client: 'pg'
  }))
  .plugin(require('../../src'));
