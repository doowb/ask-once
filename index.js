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
 * if the answer is not already stored, or if forced.
 *
 * ```js
 * var ask = new Ask({questions: questions});
 * ```
 *
 * @param {Object} `options`
 *   @param {Object} `options.questions` (optional) Options to be passed to [question-cache][]
 *   @param {Object} `options.store` (optional) Options to be passed to [data-store][]
 * @api public
 */

function Ask(options) {
  if (!(this instanceof Ask)) {
    return new Ask(options);
  }

  this.options = options || {};
  this.questions = utils.questions(this.options.questions);

  var name = this.options.store && this.options.store.name;
  name = name || (utils.project() + '.ask-once');

  this.answers = utils.store(name, this.options.store);
  this.previous = utils.store(this.answers.name + '.previous', this.answers.options);

  Object.defineProperty(this, 'data', {
    enumerable: true,
    get: function () {
      return this.answers.data;
    }
  });
}

Ask.prototype.set = function() {
  this.answers.set.apply(this.answers, arguments);
  return this;
};

Ask.prototype.get = function() {
  return this.answers.get.apply(this.answers, arguments);
};

Ask.prototype.del = function() {
  this.answers.del.apply(this.answers, arguments);
  return this;
};

/**
 * Ask a question only if the answer is not already stored. If
 * the answer is passed on the options the question is bypassed
 * and the answer is be returned.
 *
 * @param  {String} `question` Key of the question to ask.
 * @param  {Object} `options` Answers or options to force re-asking questions.
 * @param  {Function} `cb` Callback function with `err` and `answer`.
 * @api public
 */

Ask.prototype.once = function (key, options, cb) {
  if (typeof options === 'function') {
    cb = options;
    options = {};
  }

  if (typeof cb !== 'function') {
    throw new TypeError('expected callback to be a function');
  }

  var opts = utils.extend({data: {}}, this.options, options);
  var answer, prevAnswer;
  var self = this;

  function get(key) {
    return opts[key] || opts.data[key] || self.get(key);
  }

  // delete the stored answers
  if (opts.init === true) {
    prevAnswer = this.handleInit(key);
  }

  // delete the previous answer
  if (opts.force === true) {
    prevAnswer = this.handleForce(key);
  }

  answer = get(key);

  // if an answer already exists, just return it
  if (typeof answer !== 'undefined') {
    return cb(null, answer);
  }

  var question = this.getQuestion(key, prevAnswer);
  this.questions.ask(question, function (err, answers) {
    if (err) return cb(err);
    answer = utils.get(answers, key);

    // save answer to store
    self.answers.set(key, answer);
    cb(null, answer);
  });
};

Ask.prototype.getQuestion = function(key, prevAnswer) {
  prevAnswer = prevAnswer || this.previous.get(key);

  // update the default answer to use the prev answer
  if (prevAnswer && this.questions.has(key)) {
    this.defaults(key, prevAnswer, this.questions.get(key));
  } else if (prevAnswer) {
    return {
      name: key,
      default: prevAnswer
    };
  }
  return key;
};


Ask.prototype.handleInit = function(key) {
  var prevAnswer = this.get(key) || this.previous.get(key);
  this.previous.set(this.data);
  this.answers.data = {};
  this.del({force: true});
  return prevAnswer;
};

Ask.prototype.handleForce = function(key) {
  var prevAnswer = this.get(key) || this.previous.get(key);
  this.previous.set(key, prevAnswer);
  this.del(key);
  return prevAnswer;
};
/**
 * Determine defaults to used for the question.
 */

Ask.prototype.defaults = function(prop, stored, answer) {
  if (typeof answer !== 'object') return;
  if (typeof stored === 'string') {
    if (answer.type !== 'password') {
      answer.default = stored;
    }
  } else {
    for (var key in answer) {
      if (key in stored && answer[key].type !== 'password') {
        answer[key].default = stored[key];
      }
    }
  }
};

/**
 * Expose `askOnce`
 */

module.exports = Ask;
