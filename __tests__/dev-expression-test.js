/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

/* eslint-disable max-len */

let babel = require('@babel/core');
let devExpression = require('../dev-expression');

function transform(input, plugins) {
  return babel.transform(input, {
    plugins: [devExpression],
  }).code;
}

function compare(input, output) {
  var compiled = transform(input);
  expect(compiled).toEqual(output);
}

var oldEnv;

describe('dev-expression', function () {
  beforeEach(() => {
    oldEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = '';
  });

  afterEach(() => {
    process.env.NODE_ENV = oldEnv;
  });

  describe('__DEV__', () => {
    it('should replace __DEV__ in if', () => {
      compare(
        `
  if (__DEV__) {
    console.log('foo')
  }`,
        `if (process.env.NODE_ENV !== "production") {
  console.log('foo');
}`,
      );
    });

    it('should not replace locally-defined __DEV__', () => {
      compare(
        `
  const __DEV__ = false;

  if (__DEV__) {
    console.log('foo')
  }`,
        `const __DEV__ = false;

if (__DEV__) {
  console.log('foo');
}`,
      );
    });

    it('should not replace object key', () => {
      compare(
        `
  const foo = {
    __DEV__: 'hey',
  }`,
        `const foo = {
  __DEV__: 'hey'
};`,
      );
    });
  });

  it('should replace warning calls', () => {
    compare(
      "warning(condition, 'a %s b', 'c');",
      `process.env.NODE_ENV !== "production" ? warning(condition, 'a %s b', 'c') : void 0;`,
    );
  });

  it('should replace invariant calls', () => {
    compare(
      "invariant(condition, 'a %s b', 'c');",
      `!condition ? process.env.NODE_ENV !== "production" ? invariant(false, 'a %s b', 'c') : invariant(false) : void 0;`,
    );
  });

  it('should replace invariant correctly when imported and compiled', () => {
    const code = babel.transform(
      `
      import invariant from 'invariant';

      invariant(condition, 'a %s b', 'c');
    `,
      {
        plugins: ['@babel/plugin-transform-modules-commonjs', devExpression],
      },
    ).code;

    expect(code).not.toContain('invariant(');
    expect(code).toMatchInlineSnapshot(`
      "\\"use strict\\";

      var _invariant = _interopRequireDefault(require(\\"invariant\\"));

      function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

      !condition ? process.env.NODE_ENV !== \\"production\\" ? (0, _invariant.default)(false, 'a %s b', 'c') : (0, _invariant.default)(false) : void 0;"
    `);
  });
});
