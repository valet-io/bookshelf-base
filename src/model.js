'use strict';

var Promise = require('bluebird');
var Joi     = require('joi');
var _       = require('lodash');

var internals = {};

internals.registerValidation = function (model) {
  model.on('saving', function (model, attributes, options) {
    if (options && options.validation === false) return;
    return model.validate(options.validation);
  });
};

internals.eavesdrop = function (model, Model) {
  var p = model.proxy;
  if (p) {
    model.on('all', function (event) {
      if (p === true || (Array.isArray(p) && p.indexOf(event) !== -1)) {
        return Model.triggerThen.apply(Model, arguments);
      }
    }, model);
  }
};

module.exports = function (BaseModel) {
  var Model = BaseModel.extend({
    constructor: function () {
      BaseModel.apply(this, arguments);
      internals.registerValidation(this);
      internals.eavesdrop(this, this.constructor);
    },
    proxy: true,
    hasTimestamps: true,
    validate: function (options) {
      options = options || {};
      var schema = this.schema;
      return Promise
        .bind(this)
        .then(function () {
          if (!schema) return;
          if (this.hasTimestamps && !schema.created_at) {
            _.extend(schema, {
              created_at: Joi.date(),
              updated_at: Joi.date()
            });
          }
          return Promise.promisify(Joi.validate)(this.attributes, this.schema, options);
        })
        .error(function (e) {
          throw e.cause;
        })
        .then(this.set)
        .return(this.validators)
        .map(function (validator) {
          return validator.call(this);
        })
        .return(this);
    }
  });

  _.extend(Model, require('bookshelf/lib/base/events'));

  Model.extend = function () {
    var child = BaseModel.extend.apply(this, arguments);
    child.prototype.validators = [];
    return child;
  };

  return Model;

};
