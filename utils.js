'use strict';

/**
 * Lazily required module dependencies
 */

var lazy = require('lazy-cache')(require);
lazy('mixin-deep', 'merge');
lazy('data-store', 'DataStore');
lazy('isobject', 'isObject');
lazy('get-value', 'get');

/**
 * Expose utils
 */

module.exports = lazy;
