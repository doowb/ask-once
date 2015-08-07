'use strict';

var argv = require('minimist')(process.argv.slice(2));

var path = require('path');
var inquirer = require('inquirer');
var Questions = require('question-cache');
var DataStore = require('data-store');

var store = new DataStore('ask-once-example', {cwd: path.join(__dirname, '.data')});
var questions = new Questions({
  inquirer: inquirer
});

questions.set('username', {
  type: 'input',
  message: 'What\' your username?',
  default: 'undefined'
});


var ask = require('./')(questions, store);

/*
 * Provide options at the commandline
 *  - [i]nit => clear the answer from the store
 *  - [f]orce => force asking the question
 */

var options = {
  init: argv.i || argv.init,
  force: argv.f || argv.force
};

ask('username', options, function (err, answer) {
  if (err) return console.error(err);
  console.log('You\'re username is', answer);
});
