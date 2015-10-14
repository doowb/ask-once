'use strict';

/**
 * Lazily required module dependencies
 */

var utils = require('lazy-cache')(require);
var fn = require;

require = utils;
require('mixin-deep', 'merge');
require('data-store', 'DataStore');
require('isobject', 'isObject');
require('get-value', 'get');
require = fn;

/**
 * Expose utils
 */

module.exports = utils;
