/*!
 * ask-once <https://github.com/doowb/ask-once>
 *
 * Copyright (c) 2015, Brian Woodward.
 * Licensed under the MIT License.
 */

'use strict';

var assert = require('assert');

/**
 * Create a question asking function that only asks a question
 * if the answer is not found in the store or options force
 * the question.
 *
 * ```js
 * var ask = require('ask-once')(questions, store);
 * ask('username', function (err, answer) {
 *   if (err) return console.error(err);
 *   console.log(answer);
 *   //=> doowb
 * });
 * ```
 *
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
   * @param  {String} `question` Key of the question in the questions cache to ask.
   * @param  {Object} `options` Options to control re-initializing the answer or forcing the question.
   * @param  {Function} `cb` Callback function with the `err` and `answer` parameters.
   * @api public
   */

  return function ask (question, options, cb) {
    if (typeof options === 'function') {
      cb = options;
      options || {}
    }
    options = options || {};

    // `init: true` clear the answer from the store
    if (options.init === true) {
      store.del(question);
    }

    // check to see if the answer is in the store
    var answer = store.get(question);

    // if no answer in the store or if `force: true`
    // ask the question
    if (typeof answer === 'undefined' || options.force === true) {
      return questions.ask(question, cb);
    }

    // otherwise, return the stored answer
    cb(null, answer);
  };
}

/**
 * Expose `askOnce`
 */

module.exports = askOnce;
