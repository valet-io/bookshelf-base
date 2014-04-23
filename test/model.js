'use strict';

var Joi = require('joi');

var Model = require('../src')(require('bookshelf/dialects/sql/model')).Model.extend();

describe('Model', function () {

  var model;
  beforeEach(function () {
    model = new Model();
  });

  it('has timestamps', function () {
    expect(model).to.have.property('hasTimestamps').that.is.true;
  });

  describe('Model#extend', function () {

    it('applies the default behavior', function () {
      expect(Model).to.have.property('extend');
    });

    it('creates an empty array of validators', function () {
      expect(Model.prototype)
        .to.have.property('validators')
        .that.is.an.instanceOf(Array)
        .with.property('length', 0);
    });

  });

  describe('Validation', function () {

    it('triggers validation on saving', function () {
      sinon.stub(model, 'validate');
      return model.triggerThen('saving', model).finally(function () {
        expect(model.validate).to.have.been.calledOn(model);
      });
    });

    it('can override validation with options.validate === false', function () {
      sinon.stub(model, 'validate');
      return model.triggerThen('saving', model, null, {validate: false}).finally(function () {
        expect(model.validate).to.not.have.been.called;
      });
    });

    describe('#validate', function () {

      beforeEach(function () {
        sinon.spy(Joi, 'validate');
      });

      afterEach(function () {
        Joi.validate.restore();
      });

      it('validates using a Joi schema as model.schema', function () {
        model.schema = {};
        sinon.spy(model, 'toJSON');
        return model.validate().finally(function () {
          expect(model.toJSON).to.have.been.calledWithMatch({shallow: true});
          expect(Joi.validate).to.have.been.calledWithMatch(model.toJSON.firstCall.returnValue, model.schema);
        });
      });

      it('skips schema validation if !model.schema', function () {
        return model.validate().finally(function () {
          expect(Joi.validate).to.not.have.been.called;
        });
      });

      it('calls all custom validators', function () {
        var validator = sinon.spy();
        model.validators.push(validator);
        return model.validate().finally(function () {
          expect(validator).to.have.been.calledOn(model);
        });
      });

    });    

  });

  describe('Events', function () {

    it('mixes in event methods on the constructor');

    it('can proxy a set of events to the constructor');

  });

});