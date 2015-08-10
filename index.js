/*!
 * ask-once <https://github.com/doowb/ask-once>
 *
 * Copyright (c) 2015, Brian Woodward.
 * Licensed under the MIT License.
 */

'use strict';

var assert = require('assert');

/**
 * Returns a question-asking function that only asks a question
 * if the answer is not already stored.
 *
 * @name  askOnce
 * @param {Object} `questions` Pass your instance of [question-cache] on the `questions` parameter.
 * @param {Object} `store` Pass your instance of [data-store] on the `store` parameter.
 * @return {Function} Function to use when asking questions.
 * @api public
 */

function askOnce(questions, store) {
  assert(typeof questions === 'object', 'Expected `questions` to be an instance of [question-cache] but got ' + (typeof questions));
  assert(typeof store === 'object', 'Expected `store` to be an instance of [data-store] but got ' + (typeof store));


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
      options || {}
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
      cb(null, answers);
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
    questions.default = stored;
  } else {
    for (var key in questions) {
      if (key in questions && key in stored) {
        questions[key].default = stored[key];
      }
    }
  }
}

/**
 * Expose `askOnce`
 */

module.exports = askOnce;
