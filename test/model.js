'use strict';

var Joi   = require('joi'); 

describe('Model', function () {

  var knex, Model;
  beforeEach(function () {
    knex = require('./helpers/bookshelf').knex;
    Model = require('./helpers/bookshelf').Model.extend({
      tableName: 'model'
    });
  });

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
      var options = {
        validation: {}
      };
      sinon.stub(model, 'validate');
      return model.triggerThen('saving', model, null, options).then(function () {
        expect(model.validate)
          .to.have.been.calledOn(model)
          .and.calledWith(options.validation);
      });
    });

    it('can override validation with options.validation === false', function () {
      sinon.stub(model, 'validate');
      return model.triggerThen('saving', model, null, {validation: false}).then(function () {
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
        var options = {};
        return model.validate(options).then(function () {
          expect(Joi.validate).to.have.been.calledWith(model.attributes, model.schema, options);
        });
      });

      it('adds timestamps to the schema', function () {
        model.schema = {};
        return model.validate().then(function () {
          expect(model.schema).to.have.keys('created_at', 'updated_at');
        });
      });

      it('does not add timestamp fields to the schema is !hasTimestamps', function () {
        model.schema = {};
        model.hasTimestamps = false;
        return model.validate().then(function () {
          expect(model.schema).to.not.have.keys('created_at', 'updated_at');
        });
      });

      it('sets the validated data on the model', function () {
        model.schema = {
          numeric: Joi.number()
        };
        model.set('numeric', '123');
        sinon.spy(model, 'set');
        return model.validate().then(function () {
          expect(model.set).to.have.been.calledWithMatch({
            numeric: 123
          });
          expect(model.get('numeric')).to.equal(123);
        });
      });

      it('rejects if validation fails', function () {
        model.schema = {
          required: Joi.any().required()
        };
        return expect(model.validate()).to.be.rejectedWith(/required/);
      });

      it('skips schema validation if !model.schema', function () {
        return model.validate().then(function () {
          expect(Joi.validate).to.not.have.been.called;
        });
      });

      it('calls all custom validators', function () {
        var validator = sinon.spy();
        model.validators.push(validator);
        return model.validate().then(function () {
          expect(validator).to.have.been.calledOn(model);
        });
      });

      it('resolves with the model', function () {
        return expect(model.validate()).to.eventually.equal(model);
      });

    });    

  });

  describe('Events', function () {

    it('mixes in event methods on the constructor', function () {
      expect(Model).to.respondTo('triggerThen');
    });

    it('emits lifecyle events on the constructor', function () {
      var spy = sinon.spy();
      Model.on('proxyEvent', spy);
      model.trigger('proxyEvent', model);
      expect(spy).to.have.been.calledWith(model);
    });

    it('can emit only select events', function () {
      var registered = sinon.spy();
      var ignored = sinon.spy();
      Model.prototype.proxy = ['p1', 'p2'];
      model = new Model();
      Model.on('p1 p2', registered);
      Model.on('p3', ignored);
      model.trigger('p1 p2 p3', model);
      expect(registered)
        .to.have.been.calledTwice
        .and.calledWith(model);
      expect(ignored).to.not.have.been.called;
    });

    it('can disable proxying', function () {
      var spy = sinon.spy();
      Model.prototype.proxy = false;
      model = new Model();
      Model.on('e', spy);
      model.trigger('e');
      expect(spy).to.not.have.been.called;
    });

  });

});
