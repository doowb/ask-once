'use strict';

var path = require('path');
var assert = require('assert');
var inquirer = require('inquirer');
var DataStore = require('data-store');
var Questions = require('question-cache');
var store, questions;

describe('ask-once', function () {
  beforeEach(function () {
    store = new DataStore('ask-question-tests', {cwd: path.join(__dirname, 'tmp', '.data')});
    questions = new Questions({
      inquirer: inquirer
    });
  });

  it('should create a new ask function', function () {
    var ask = require('./')(questions, store);
    console.log(ask);
  });
});
