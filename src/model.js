'use strict';

var Promise = require('bluebird');
var Joi     = require('joi');
var _       = require('lodash');

var internals = {};

internals.registerValidation = function (model) {
  model.on('saving', function (model, attributes, options) {
    if (options && options.validate === false) return;
    return model.validate();
  });
};

module.exports = function (BaseModel) {
  var Model = BaseModel.extend({
    constructor: function () {
      BaseModel.apply(this, arguments);
      internals.registerValidation(this);
    },
    hasTimestamps: true,
    validate: function () {
      var value = _.omit(this.toJSON({shallow: true}), 'created_at', 'updated_at');
      var schema = this.schema;
      return Promise
        .bind(this)
        .then(function () {
          if (schema) return Promise.promisify(Joi.validate)(value, schema);
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

  Model.extend = function () {
    var child = BaseModel.extend.apply(this, arguments);
    child.prototype.validators = [];
    return child;
  };

  return Model;

};