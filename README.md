# ask-once [![NPM version](https://badge.fury.io/js/ask-once.svg)](http://badge.fury.io/js/ask-once)  [![Build Status](https://travis-ci.org/doowb/ask-once.svg)](https://travis-ci.org/doowb/ask-once)

> Only ask a question one time and store the answer.

## Install

Install with [npm](https://www.npmjs.com/)

```sh
$ npm i ask-once && question-cache --save
```

## Usage

**1. Pass an instance of question-cache**

```js
var questions = require('question-cache')();
var ask = require('ask-once')({questions: questions});
```

**2. Ask a question!**

```js
ask('May I have your username?', function (err, answer) {
  console.log(answer);
});
```

The user's answer is saved, and the question won't be asked again unless:

* `force: true` is passed on the options, or
* the answer is deleted directly

## FAQ

**Where are the answers stored?**

The user's answers are saved on a global config store that is uniquely identified to the application using `ask-once`.

**Can I change where answers are stored?**

Yes, you can pass your own instance of [data-store](https://github.com/jonschlinkert/data-store) with the `cwd` option set to whatever you want it to be. Here's an example:

```js
var questions = require('question-cache')();
// pass your own instance of data-store, so you can use
// whatever storage location you want
var store = require('data-store')('foo', {cwd: 'bar'});

var ask = require('ask-once')({
  questions: questions,
  store: store
});

ask('May I have your username?' function (err, answer) {
  console.log(answer);
});
```

## Docs

### options

> To re-ask questions or reset the stored values:

* `options.force`: will re-ask the given question or questions, regardless of whether or not previously stored values exists.
* `options.init`: will **delete the entire store** and start over again.

### API

### [Ask](index.js#L27)

Returns a question-asking function that only asks a question if the answer is not already stored, or if forced.

**Params**

* `options` **{Object}**
* `options.questions` **{Object}**: (required) Pass an instance of [question-cache][]
* `options.store` **{Object}**: (optional) Pass an instance of [data-store](https://github.com/jonschlinkert/data-store)

**Example**

```js
var ask = new Ask({questions: questions});
```

### [.once](index.js#L57)

Ask a question only if the answer is not already stored. If
the answer is passed on the options the question is bypassed
and the answer is be returned.

**Params**

* `question` **{String}**: Key of the question to ask.
* `options` **{Object}**: Answers or options to force re-asking questions.
* `cb` **{Function}**: Callback function with `err` and `answer`.

## Examples

First time the program is run, the user is prompted to answer a question:

[![image](https://cloud.githubusercontent.com/assets/995160/9158076/78bf87e6-3ede-11e5-8bbc-dac8a55353c2.png)](https://www.npmjs.com/)

Additional runs of the program will skip prompting the user:

[![image](https://cloud.githubusercontent.com/assets/995160/9158091/ec592b58-3ede-11e5-8f18-4fc4b1327d2b.png)](https://github.com/jonschlinkert/data-store)

Passing the `init` option will delete all the stored answers and prompt the user to answer the question again:

[![image](https://cloud.githubusercontent.com/assets/995160/9158111/22e24ff6-3edf-11e5-95c9-bc2314367557.png)](index.js#L27)

Additional runs after clearing the stop will return the newly saved answer:

[![image](https://cloud.githubusercontent.com/assets/995160/9158120/43c16d60-3edf-11e5-8d85-a98b029fd743.png)](https://github.com/jonschlinkert/data-store)

Passing the `force` option will force the question to be asked:

[![image](https://cloud.githubusercontent.com/assets/995160/9158137/740bef0e-3edf-11e5-898d-d9ce72f28ad2.png)](index.js#L57)

Additional runs after forcing the question, will return the newly saved answer:

![image](https://cloud.githubusercontent.com/assets/995160/9158144/8fd63550-3edf-11e5-8daa-b19fa251bc66.png)

## Related projects

* [data-store](https://www.npmjs.com/package/data-store): Easily get, set and persist config data. | [homepage](https://github.com/jonschlinkert/data-store)
* [inquirer](https://www.npmjs.com/package/inquirer): A collection of common interactive command line user interfaces. | [homepage](https://github.com/sboudrias/Inquirer.js)
* [question-cache](https://www.npmjs.com/package/question-cache): A wrapper around inquirer that makes it easy to create and selectively reuse questions. | [homepage](https://github.com/jonschlinkert/question-cache)
* [question-helper](https://www.npmjs.com/package/question-helper): Template helper that asks a question in the command line and resolves the template with… [more](https://www.npmjs.com/package/question-helper) | [homepage](https://github.com/doowb/question-helper)

## Running tests

Install dev dependencies:

```sh
$ npm i -d && npm test
```

## Contributing

Pull requests and stars are always welcome. For bugs and feature requests, [please create an issue](https://github.com/doowb/ask-once/issues/new).

## Author

**Brian Woodward**

+ [github/doowb](https://github.com/doowb)
+ [twitter/doowb](http://twitter.com/doowb)

## License

Copyright © 2015 Brian Woodward
Released under the MIT license.

***

_This file was generated by [verb-cli](https://github.com/assemble/verb-cli) on October 14, 2015._