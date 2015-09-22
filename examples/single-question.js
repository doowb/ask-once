'use strict';

var path = require('path');
var questions = require('question-cache')();

/*
 * Provide options at the commandline
 *  - [i]nit  => clear the answer from the store
 *  - [f]orce => force asking the question
 */

var argv = require('minimist')(process.argv.slice(2), {
  alias: {force: 'f', init: 'i'}
});

var store = require('data-store')('ask-once-example', {
  cwd: path.join(__dirname, '.data')
});

questions
  .set('username', 'What is your username?')
  .set('name.first', 'First name?')
  .set('name.last', 'Last name?');

var ask = require('..')({questions: questions, store: store});

ask('username', argv, function (err, answer) {
  if (err) return console.error(err);
  console.log('You\'re username is', answer);
});
