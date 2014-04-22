'use strict';

var Joi = require('joi');

var Model = require('../src')(require('bookshelf/dialects/sql/model')).Model;

describe('Model', function () {

  var model;
  beforeEach(function () {
    model = new Model();
  });

  it('has timestamps', function () {
    expect(model).to.have.property('hasTimestamps').that.is.true;
  });

  describe('Validation', function () {

    beforeEach(function () {
      sinon.stub(Joi, 'validate');
    });

    afterEach(function () {
      Joi.validate.restore();
    });

    it('validates on `saving`', function () {
      sinon.spy(Model.prototype, '_validate');
      model = new Model();
      return model.triggerThen('saving').finally(function () {
        expect(model._validate).to.have.been.calledOnce;
      });
    });

    it('validates using a Joi schema as model.schema', function () {
      return model._validate().finally(function () {
        expect(Joi.validate).to.have.been.calledWithMatch(model.toJSON({shallow: true}), model.schema);
      });
    });

    it('skips schema validation if !model.schema');

    it('calls model#validate if available');

  });

  describe('Events', function () {

    it('mixes in event methods on the constructor');

    it('can proxy a set of events to the constructor');

  });

});