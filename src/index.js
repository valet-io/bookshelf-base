'use strict';

module.exports = function (bookshelf) {
  bookshelf.Model = require('./model')(bookshelf.Model);
  bookshelf.Collection = require('./collection')(bookshelf.Collection);
  return bookshelf;
};
