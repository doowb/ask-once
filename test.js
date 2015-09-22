'use strict';

/* deps: mocha */
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

  it('should create a new ask function', function () {
    var ask = askOnce({
      questions: questions,
      store: store
    });
    assert.equal(typeof ask, 'function');
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

  it('should use ', function () {
    var ask = askOnce({
      questions: questions,
      store: store,
      data: {foo: 'bar'}
    });

    assert.equal(ask.hasOwnProperty('config'), true);
    assert.equal(ask.config.data.foo, 'bar');
  });
});
