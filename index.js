/*!
 * ask-once <https://github.com/doowb/ask-once>
 *
 * Copyright (c) 2015, Brian Woodward.
 * Licensed under the MIT License.
 */

'use strict';

var path = require('path');
var utils = require('./utils');

/**
 * Returns a question-asking function that only asks a question
 * if the answer is not already stored.
 *
 * @name  askOnce
 * @param {Object} `questions` Pass your instance of [question-cache][] on the `questions` parameter.
 * @param {Object} `store` Pass your instance of [data-store][] on the `store` parameter.
 * @return {Function} Function to use when asking questions.
 * @api public
 */

function askOnce (questions, store, options) {
  if (!utils.isObject(questions)) {
    throw new Error('Expected `questions` to be an '
      + 'instance of [question-cache] but got: ' + (typeof questions));
  }

  if (has(questions, 'questions')) {
    options = questions;
    questions = options.questions;
    delete options.questions;
  }

  var Store = utils.DataStore;

  if (has(questions, 'store')) {
    store = questions.store;

  } else if (typeof store === 'string') {
    store = new Store('ask.' + store, options);

  } else if (typeof store === 'undefined') {
    store = new Store('ask.' + moduleCaller(module), options);
  }

  /**
   * Ask a question only if the answer is not stored.
   *
   * @name  ask
   * @param  {String} `question` Key of the question in the questions cache to ask.
   * @param  {Object} `options` Options to control re-initializing the answer or forcing the question.
   * @param  {Function} `cb` Callback function with the `err` and `answer` parameters.
   * @api public
   */

  return function ask (key, options, cb) {
    if (typeof options === 'function') {
      cb = options;
      options = {};
    }

    options = options || {};
    var answer, previousAnswer;

    if (options.init === true) {
      previousAnswer = store.get(key);
      // delete the store
      store.del({force: true});
    } else if (options.force === true) {
      previousAnswer = store.get(key);
      // delete the last answer
      store.del(key);
    } else {
      // check to see if the answer is in the store
      answer = store.get(key);
    }

    // if an answer (still) exists, return it
    if (typeof answer !== 'undefined') {
      return cb(null, answer);
    }

    // override the default answer with the prev answer
    if (previousAnswer && questions.has(key)) {
      defaults(key, previousAnswer, questions.get(key));
    }

    questions.ask(key, function (err, answers) {
      if (err) return cb(err);

      // save answer to store
      store.set(answers);
      cb(null, utils.get(answers, key));
    });
  };
}

/**
 * Update the `default` property of the given question or questions
 * to be the previously stored value - if one exists.
 *
 * @param  {String} `prop` Question key, may use dot notation.
 * @param  {any} `stored` Any stored value
 * @param  {String} `questions` Question(s) object
 */

function defaults(prop, stored, questions) {
  if (typeof questions !== 'object') return;
  if (typeof stored === 'string') {
    if (questions.type !== 'password') {
      questions.default = stored;
    }
  } else {
    for (var key in questions) {
      if (key in questions && key in stored) {
        if (questions[key].type !== 'password') {
          questions[key].default = stored[key];
        }
      }
    }
  }
}

/**
 * Return the resolved name of the module that
 * originates the call to `ask-once`.
 *
 * @param  {Object} `mod` module object to get parent from.
 * @return {string} resolved name (filename or dirname)
 */

function moduleCaller(mod) {
  var parent = mod;
  while (parent.parent) {
    parent = parent.parent;
  }
  var name = basename(path.resolve(parent.id));
  if (name === 'index') {
    name = path.dirname(path.resolve(parent.id));
  }
  return name;
}

/**
 * Return true if `obj` has _own_ property `key`
 * @param  {Object} `obj`
 * @return {String} `key`
 */

function has (obj, key) {
  return obj.hasOwnProperty(key);
}

/**
 * Get the file basename.
 * @param  {String} `fp` filepath
 * @return {String} basename
 */

function basename (fp) {
  return path.basename(fp, path.extname(fp));
}

/**
 * Expose `askOnce`
 */

module.exports = askOnce;
