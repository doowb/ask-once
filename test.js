'use strict';

var path = require('path');
var assert = require('assert');
var Store = require('data-store');
var Questions = require('question-cache');
var Ask = require('./');
var store, questions;
var ask;


describe('ask-once', function () {
  beforeEach(function () {
    questions = new Questions();
    store = new Store('ask-question-tests', {
      cwd: path.join(__dirname, 'tmp', '.data')
    });

    ask = new Ask({questions: questions, store: store});
  });

  after(function () {
    store.del({force: true});
  });

  it('should return an instance of Ask', function () {
    assert(ask instanceof Ask);
  });

  it('should instantiate without new', function () {
    var foo = Ask({questions: questions, store: store});
    assert(foo instanceof Ask);
  });

  it('should create a new ask function', function () {
    assert.equal(typeof ask.once, 'function');
  });

  it('should throw an error callback is not passed', function (done) {
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

  it('should throw an error when no options are passed', function (done) {
    try {
      new Ask();
      done(new Error('expected an error'));
    } catch(err) {
      assert(err);
      assert(err.message);
      assert(err.message === 'expected an instance of `question-cache`');
      done();
    }
  });

  it('should throw an error when `questions` is not passed', function (done) {
    try {
      new Ask({store: store});
      done(new Error('expected an error'));
    } catch(err) {
      assert(err);
      assert(err.message);
      assert(err.message === 'expected an instance of `question-cache`');
      done();
    }
  });

  it('should use the name of the store passed on the options', function () {
    ask = new Ask({
      questions: questions,
      store: new Store('a-b-c')
    });

    assert(ask.store.name);
    assert(ask.store.name === 'a-b-c');
    store.del({force: true});
  });

  it('should prepend `ask-once` to module caller when store is undefined', function () {
    ask = new Ask({questions: questions});
    assert(ask.store.name);
    assert(ask.store.name === 'ask-once.ask-once');
    store.del({force: true});
  });

  it('should expose the options object on ask', function () {
    ask = new Ask({
      questions: questions,
      store: store,
      data: {foo: 'bar'}
    });

    assert.equal(ask.hasOwnProperty('options'), true);
    assert.equal(ask.options.data.foo, 'bar');
  });

  it('should use values from the `data` object', function (done) {
    ask = new Ask({
      questions: questions,
      store: store,
      data: {aaa: 'bbb'}
    });

    ask.once('aaa', function (err, answer) {
      assert(!err);
      assert(answer);
      assert(answer === 'bbb');
      done();
    });
  });

  it('should delete the store when `options.init` is defined', function (done) {
    store.set('a', 'b');
    store.set('c', 'd');

    ask = new Ask({
      questions: questions,
      store: store,
    });

    ask.once('aaa', {init: true, data: {aaa: 'bbb'}}, function (err, answer) {
      assert(!err);
      assert(answer);
      assert(answer === 'bbb');
      assert(!store.has('a'));
      assert(!store.has('c'));
      done();
    });
  });

  it('should re-ask when `options.force` is defined', function (done) {
    store.set('a', 'b');
    store.set('c', 'd');

    ask = new Ask({
      questions: questions,
      store: store,
    });

    ask.once('a', {force: true, data: {a: 'bbb'}}, function (err, answer) {
      assert(!err);
      assert(answer);
      assert(answer === 'bbb');
      done();
    });
  });

  it('should use values from the options', function (done) {
    ask = new Ask({
      questions: questions,
      store: store
    });

    ask.once('ccc', {ccc: 'ddd'}, function (err, answer) {
      assert(!err);
      assert(answer);
      assert(answer === 'ddd');
      done();
    });
  });

  it('should use stored values', function (done) {
    ask = new Ask({
      questions: questions,
      store: store
    });

    store.set('eee', 'fff');

    ask.once('eee', function (err, answer) {
      assert(!err);
      assert(answer);
      assert(answer === 'fff');
      store.del('eee');
      done();
    });
  });

  it('should use options values over stored values', function (done) {
    ask = new Ask({
      questions: questions,
      store: store
    });

    store.set('eee', 'fff');

    ask.once('eee', {eee: 'zzz'}, function (err, answer) {
      assert(!err);
      assert(answer);
      assert(answer === 'zzz');
      store.del('eee');
      done();
    });
  });
});
