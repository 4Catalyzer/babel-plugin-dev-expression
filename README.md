# babel-plugin-dev-expression [![npm version](https://badge.fury.io/js/babel-plugin-dev-expression.svg)](https://badge.fury.io/js/babel-plugin-dev-expression)

A mirror of Facebook's dev-expression Babel plugin.

This plugin reduces or eliminates development checks from production code.

## `__DEV__`

Replaces

```js
__DEV__
```

with

```js
process.env.NODE_ENV !== 'production'
```

## `invariant`

Replaces

```js
invariant(condition, argument, argument);
```

with

```js
if (!condition) {
  if ("production" !== process.env.NODE_ENV) {
    invariant(false, argument, argument);
  } else {
    invariant(false);
  }
}
```

## `warning`

Replaces

```js
warning(condition, argument, argument);
```

with

```js
if ("production" !== process.env.NODE_ENV) {
  warning(condition, argument, argument);
}
```
