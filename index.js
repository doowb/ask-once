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

function askOnce(options) {
  if (!options || !utils.isObject(options.questions)) {
    throw new Error('expected an instance of `question-cache`');
  }

  var config = {};
  var Store = utils.DataStore;
  var store, name;

  if (options.store && options.store instanceof Store) {
    store = options.store;

  } else if (typeof options.store === 'string') {
    name = options.store;
    delete options.store;
    store = new Store(name, options);

  } else {
    store = new Store('ask-once.' + moduleCaller(module), options);
  }

  config.store = store;
  config.questions = options.questions;
  config.data = options.data || {};

  /**
   * Ask a question only if the answer is not stored.
   *
   * @name  ask
   * @param  {String} `question` Key of the question in the questions cache to ask.
   * @param  {Object} `options` Options to control re-initializing the answer or forcing the question.
   * @param  {Function} `cb` Callback function with the `err` and `answer` parameters.
   * @api public
   */

  function ask (key, opts, cb) {
    if (typeof opts === 'function') {
      cb = opts;
      opts = {};
    }

    opts = utils.merge({data: {}}, config, opts);
    var answer, previousAnswer;
    var questions = config.questions;

    function get(key) {
      return opts.data[key] || opts[key] || store.get(key);
    }

    if (opts.init === true) {
      previousAnswer = get(key);
      // delete the store
      store.del({force: true});

    } else if (opts.force === true) {
      previousAnswer = get(key);
      // delete the last answer
      store.del(key);

    } else {
      // check to see if the answer is in the store
      answer = get(key);
    }

    // if an answer (still) actually exists, just return it
    if (typeof answer !== 'undefined') {
      return cb(null, answer);
    }

    // override the default answer with the prev answer
    if (previousAnswer && questions.has(key)) {
      defaults(key, previousAnswer, questions.get(key));
    }
    console.log(previousAnswer)

    questions.ask(key, function (err, answers) {
      if (err) return cb(err);

      // save answer to store
      store.set(answers);
      cb(null, utils.get(answers, key));
    });
  }

  ask.config = config;
  return ask;
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
