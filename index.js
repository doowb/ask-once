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
 *   @param {Object} `options.questions` (required) Pass an instance of [question-cache][]
 *   @param {Object} `options.store` (optional) Pass an instance of [data-store][]
 * @api public
 */

function Ask(options) {
  if (!(this instanceof Ask)) {
    return new Ask(options);
  }

  if (!options || !options.questions) {
    throw new Error('expected an instance of `question-cache`');
  }

  this.options = options || {};
  if (typeof this.options.store === 'object') {
    this.store = this.options.store;
    delete this.options.store;
  } else {
    var name = moduleCaller(module);
    this.store = new utils.Store('ask-once.' + name, this.options);
  }
}

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

  var opts = utils.merge({data: {}}, this.options, options);
  this.questions = opts.questions;
  var answer, prevAnswer;
  var self = this;

  function get(key) {
    return opts[key] || opts.data[key] || self.store.get(key);
  }

  // delete the store
  if (opts.init === true) {
    prevAnswer = self.store.get(key);
    this.store.data = {};
    this.store.del({force: true});
    delete opts.init;
    return this.once(key, opts, cb);
  }

  // delete the previous answer
  if (opts.force === true) {
    prevAnswer = self.store.get(key);
    this.store.del(key);
    delete opts.force;
    return this.once(key, opts, cb);
  }

  answer = get(key);

  // if an answer already exists, just return it
  if (typeof answer !== 'undefined') {
    return cb(null, answer);
  }

  // update the default answer to use the prev answer
  if (prevAnswer && this.questions.has(key)) {
    this.defaults(key, prevAnswer, this.questions.get(key));
  }

  this.questions.ask(key, function (err, answers) {
    if (err) return cb(err);
    answer = utils.get(answers, key);

    // save answer to store
    self.store.set(key, answer);
    cb(null, answer);
  });
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

module.exports = Ask;
