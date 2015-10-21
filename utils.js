'use strict';

/**
 * Lazily required module dependencies
 */

var utils = require('lazy-cache')(require);
var fn = require;

require = utils;
require('question-cache', 'questions');
require('extend-shallow', 'extend');
require('project-name', 'project');
require('isobject', 'isObject');
require('data-store', 'store');
require('get-value', 'get');
require = fn;

/**
 * Expose utils
 */

module.exports = utils;
