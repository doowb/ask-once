'use strict';

var path = require('path');
var sinon = require('sinon');
var assert = require('assert');
var Store = require('data-store');
var Questions = require('question-cache');
var utils = require('./utils');
var Ask = require('./');
var ask;


describe('ask-once', function () {
  var options = {
    store: {
      name: 'ask-question-tests',
      cwd: path.join(__dirname, 'tmp', '.data')
    }
  };

  beforeEach(function () {
    ask = new Ask(options);
  });

  after(function () {
    ask.del({force: true});
    ask.previous.del({force: true});
  });

  it('should return an instance of Ask', function () {
    assert(ask instanceof Ask);
  });

  it('should instantiate without new', function () {
    var foo = Ask(options);
    assert(foo instanceof Ask);
  });

  it('should create a new ask instance with methods', function () {
    assert.equal(typeof ask.once, 'function');
    assert.equal(typeof ask.get, 'function');
    assert.equal(typeof ask.set, 'function');
    assert.equal(typeof ask.del, 'function');
  });

  it('should throw an error when callback is not passed', function (done) {
    try {
      ask.once();
      done(new Error('expected an error'));
    } catch(err) {
      assert(err);
      assert(err.message);
      assert(err.message === 'expected callback to be a function');
      done();
    }
  });

  it('should use the name of the store passed on the options', function () {
    var ask = new Ask(utils.extend({}, options, {store: {name: 'a-b-c'}}));

    assert(ask.answers.name);
    assert(ask.answers.name === 'a-b-c');
    ask.del({force: true});
  });

  it('should prepend `ask-once` to project name when store options are undefined', function () {
    var ask = new Ask();
    assert(ask.answers.name);
    assert(ask.answers.name === 'ask-once.ask-once');
    ask.del({force: true});
  });

  it('should expose the options object on ask', function () {
    var ask = new Ask({data: {foo: 'bar'}});

    assert.equal(ask.hasOwnProperty('options'), true);
    assert.equal(ask.options.data.foo, 'bar');
    ask.del({force: true});
  });

  it('should use values from the `data` object', function (done) {
    var ask = new Ask({data: {aaa: 'bbb'}});

    ask.once('aaa', function (err, answer) {
      assert(!err);
      assert(answer);
      assert(answer === 'bbb');
      ask.del({force: true});
      done();
    });
  });

  it('should delete the store when `options.init` is defined', function (done) {
    ask.set('a', 'b');
    ask.set('c', 'd');
    ask.once('aaa', {init: true, data: {aaa: 'bbb'}}, function (err, answer) {
      assert(!err);
      assert(answer);
      assert(answer === 'bbb');
      assert(!ask.answers.has('a'));
      assert(!ask.answers.has('c'));
      done();
    });
  });

  it('should re-ask when `options.force` is defined', function (done) {
    ask.set('a', 'b');
    ask.set('c', 'd');

    ask.once('a', {force: true, data: {a: 'bbb'}}, function (err, answer) {
      assert(!err);
      assert(answer);
      assert(answer === 'bbb');
      done();
    });
  });

  it('should use values from the options', function (done) {
    ask.once('ccc', {ccc: 'ddd'}, function (err, answer) {
      assert(!err);
      assert(answer);
      assert(answer === 'ddd');
      done();
    });
  });

  it('should use stored values', function (done) {
    ask.set('eee', 'fff');
    ask.once('eee', function (err, answer) {
      assert(!err);
      assert(answer);
      assert(answer === 'fff');
      done();
    });
  });

  it('should use options values over stored values', function (done) {
    ask.set('eee', 'fff');
    ask.once('eee', {eee: 'zzz'}, function (err, answer) {
      assert(!err);
      assert(answer);
      assert(answer === 'zzz');
      done();
    });
  });

  describe('stubbed questions.ask', function () {
    var stub = function (fn) {
      sinon.stub(ask.questions, 'ask', fn);
    }
    afterEach(function () {
      ask.questions.ask.restore();
    });

    it('should handle an error returned in the callback', function (done) {
      stub(function (question, cb) {
        return cb(new Error('Fake Error'));
      });

      ask.once('foo', function (err, answer) {
        assert(err);
        assert(!answer);
        done();
      });
    });

    it('should update the default on the question to ask with the previous answer', function (done) {
      stub(function (question, cb) {
        return cb(null, {bar: 'boop'});
      });

      ask.set('bar', 'baz');
      ask.questions.set('bar');
      assert.deepEqual(ask.questions.get('bar'), { message: 'bar?', type: 'input', name: 'bar' });
      ask.once('bar', {force: true}, function (err, answer) {
        assert(!err);
        assert(answer);
        assert(answer === 'boop');
        assert.deepEqual(ask.questions.get('bar'), { message: 'bar?', default: 'baz', type: 'input', name: 'bar' });
        done();
      });
    });

    it('should use a previously stored value when init is passed on a previous question', function (done) {
      stub(function (question, cb) {
        return cb(null, {bar: 'boop'});
      });

      ask.set('foo', 'bar');
      ask.set('bar', 'baz');
      ask.once('foo', {init: true, foo: 'beep'}, function (err, answer) {
        assert(!err);
        assert(answer);
        assert(answer === 'beep');
        ask.once('bar', function (err, answer) {
          assert(!err);
          assert(answer);
          assert(answer === 'boop');
          done();
        });
      });
    });
  });
});
