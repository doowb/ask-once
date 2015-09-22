'use strict';

var argv = require('minimist')(process.argv.slice(2), {
  alias: {force: 'f', init: 'i'}
});

var path = require('path');
var inquirer = require('inquirer');
var Questions = require('question-cache');
var questions = new Questions({
  inquirer: inquirer
});

questions
  .set('username', 'What is your username?')
  .set('name.first', 'First name?')
  .set('name.last', 'Last name?');

var ask = require('..')({questions: questions});

/*
 * Provide options at the commandline
 *  - [i]nit => clear the answer from the store
 *  - [f]orce => force asking the question
 */

ask('username', argv, function (err, answer) {
  if (err) return console.error(err);
  console.log('You\'re username is', answer);
});
