'use strict';

module.exports = function (Bookshelf) {
  Bookshelf.Model = require('./model')(Bookshelf.Model);
  Bookshelf.Collection = require('./collection')(Bookshelf.Collection);
  return Bookshelf;
};