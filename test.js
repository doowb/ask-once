'use strict';

/* deps: mocha */
var path = require('path');
var assert = require('assert');
var DataStore = require('data-store');
var Questions = require('question-cache');
var store, questions;

describe('ask-once', function () {
  beforeEach(function () {
    questions = new Questions();
    store = new DataStore('ask-question-tests', {
      cwd: path.join(__dirname, 'tmp', '.data')
    });
  });

  it('should create a new ask function', function () {
    var ask = require('./')(questions, store);
    assert.equal(typeof ask, 'function');
  });

  it('should support passing an options object', function () {
    var ask = require('./')({questions: questions, store: store});
    assert.equal(typeof ask, 'function');
  });
});
