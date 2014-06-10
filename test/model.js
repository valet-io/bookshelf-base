'use strict';

var Joi   = require('joi');
var Model = require('./helpers/bookshelf').Model.extend(); 

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

  describe('#parse', function () {

    it('parses JSON columns to objects', function () {
      var data = {
        foo: 'bar'
      };
      model.json = ['json_col'];
      expect(model.parse({
        json_col: JSON.stringify(data)
      }))
      .to.have.a.property('json_col')
      .that.deep.equals(data);
    });

    it('ignores normal columns', function () {
      expect(model.parse({
        normal: 'data'
      }))
      .to.have.a.property('normal', 'data');
    });

    it('can handle no JSON columns defined', function () {
      expect(model.parse).to.not.throw();
    });

  });

  describe('#format', function () {

    it('stringifies JSON columns', function () {
      var data = {
        foo: 'bar'
      };
      model.json = ['json_col'];
      expect(model.format({
        json_col: data
      }))
      .to.have.a.property('json_col')
      .that.equals(JSON.stringify(data));
    });

    it('ignores normal columns', function () {
      expect(model.format({
        normal: 'data'
      }))
      .to.have.a.property('normal', 'data');
    });

    it('can handle no JSON columns defined', function () {
      expect(model.format).to.not.throw();
    });

  });

  describe('Validation', function () {

    it('triggers validation on saving', function () {
      var options = {
        validation: {}
      };
      sinon.stub(model, 'validate');
      return model.triggerThen('saving', model, null, options).finally(function () {
        expect(model.validate)
          .to.have.been.calledOn(model)
          .and.calledWith(options.validation);
      });
    });

    it('can override validation with options.validation === false', function () {
      sinon.stub(model, 'validate');
      return model.triggerThen('saving', model, null, {validation: false}).finally(function () {
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
        sinon.spy(model, 'toJSON');
        return model.validate(options).finally(function () {
          expect(Joi.validate).to.have.been.calledWith(model.attributes, model.schema, options);
        });
      });

      it('sets the validated data on the model', function () {
        model.schema = {
          numeric: Joi.number()
        };
        model.set('numeric', '123');
        sinon.spy(model, 'set');
        return model.validate().finally(function () {
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

      it('resolves with the model', function () {
        return expect(model.validate()).to.eventually.equal(model);
      });

    });    

  });

  describe('Events', function () {

    it('mixes in event methods on the constructor');

    it('emits lifecyle events on the constructor');

  });

});
