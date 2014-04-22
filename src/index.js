'use strict';

module.exports = function (Bookshelf) {
  require('./model')(Bookshelf.Model);
  require('./collection')(Bookshelf.Collection);
  return Bookshelf;
};