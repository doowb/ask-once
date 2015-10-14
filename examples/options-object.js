'use strict';

var path = require('path');
var cwd = path.join(__dirname, '.data');

// set flags/aliases on minimist
var argv = require('minimist')(process.argv.slice(2), {
  alias: {force: 'f', init: 'i'}
});

var questions = require('question-cache')();
var dataStore = require('data-store')('ask-once-example', {cwd: cwd});
var ask = require('..')({questions: questions, store: dataStore});


questions
  .set('username', 'What is your username?')
  .set('name.first', 'First name?')
  .set('name.last', 'Last name?');

/*
 * Provide options at the commandline
 *  - [i]nit => clear the answer from the store
 *  - [f]orce => force asking the question
 */

ask.once('username', argv, function (err, answer) {
  if (err) return console.error(err);
  console.log('You\'re username is', answer);
});
