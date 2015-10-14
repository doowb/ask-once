'use strict';

var path = require('path');
var assert = require('assert');
var DataStore = require('data-store');
var Questions = require('question-cache');
var askOnce = require('./');
var store, questions;


describe('ask-once', function () {
  beforeEach(function () {
    questions = new Questions();
    store = new DataStore('ask-question-tests', {
      cwd: path.join(__dirname, 'tmp', '.data')
    });
  });

  after(function () {
    store.del({force: true});
  });

  it('should create a new ask function', function () {
    var ask = askOnce({
      questions: questions,
      store: store
    });
    assert.equal(typeof ask, 'function');
  });

  it('should throw an error when no options are passed', function (done) {
    try {
      askOnce();
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
      askOnce({store: store});
      done(new Error('expected an error'));
    } catch(err) {
      assert(err);
      assert(err.message);
      assert(err.message === 'expected an instance of `question-cache`');
      done();
    }
  });

  it('should support the store name being passed on the options', function () {
    var ask = askOnce({
      questions: questions,
      store: 'whatever'
    });

    assert(ask.config.store.name);
    assert(ask.config.store.name === 'whatever');
    store.del({force: true});
  });

  it('should prepend `ask-once` to module caller when store name is undefined', function () {
    var ask = askOnce({questions: questions});
    assert(ask.config.store.name);
    assert(ask.config.store.name === 'ask-once.ask-once');
    store.del({force: true});
  });

  it('should expose the config object on ask', function () {
    var ask = askOnce({
      questions: questions,
      store: store,
      data: {foo: 'bar'}
    });

    assert.equal(ask.hasOwnProperty('config'), true);
    assert.equal(ask.config.data.foo, 'bar');
  });

  it('should use values from the `data` object', function (done) {
    var ask = askOnce({
      questions: questions,
      store: store,
      data: {aaa: 'bbb'}
    });

    ask('aaa', function (err, answer) {
      assert(!err);
      assert(answer);
      assert(answer === 'bbb');
      done();
    });
  });

  // it('should delete the store when `options.init` is defined', function (done) {
  //   store.set('a', 'b');
  //   store.set('c', 'd');

  //   var ask = askOnce({
  //     questions: questions,
  //     store: store,
  //   });

  //   ask('aaa', {init: true, data: {aaa: 'bbb'}}, function (err, answer) {
  //     assert(!err);
  //     assert(answer);
  //     assert(answer === 'bbb');
  //     assert(store.has('a'));
  //     assert(store.has('c'));
  //     done();
  //   });
  // });

  it('should use values from the options', function (done) {
    var ask = askOnce({
      questions: questions,
      store: store
    });

    ask('ccc', {ccc: 'ddd'}, function (err, answer) {
      assert(!err);
      assert(answer);
      assert(answer === 'ddd');
      done();
    });
  });

  it('should use stored values', function (done) {
    var ask = askOnce({
      questions: questions,
      store: store
    });

    store.set('eee', 'fff');

    ask('eee', function (err, answer) {
      assert(!err);
      assert(answer);
      assert(answer === 'fff');
      store.del('eee');
      done();
    });
  });

  it('should use options values over stored values', function (done) {
    var ask = askOnce({
      questions: questions,
      store: store
    });

    store.set('eee', 'fff');

    ask('eee', {eee: 'zzz'}, function (err, answer) {
      assert(!err);
      assert(answer);
      assert(answer === 'zzz');
      store.del('eee');
      done();
    });
  });
});
