'use strict';

var Promise = require('bluebird');
var Joi     = require('joi');

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
      return this.schema ? Promise.promisify(Joi.validate)(this.toJSON({shallow: true}), this.schema) : Promise
        .bind(this)
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