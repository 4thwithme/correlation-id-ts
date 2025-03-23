# Correlation ID (with types) for nodejs

## Install

```shell
npm i correlation-id-ts --save
```

## Compatibility

Requires node >=12.17.0.

## API

### `withId([id,] work)`

Executes function `work` and returns result returned from `work`. Inside work and any other nested functions (sync or async) executions `getId()` will return the same id. The id for the context may be set explicitly with the optional `correlationId` parameter, otherwise it will be a v4 uuid. Calls to `withId()` may be nested.

```javascript
correlator.withId({
  correlationId: "meow",
  fn: () => {
    console.log(correlator.getId()); //meow
  },
});
correlator.withId({
  fn: () => {
    console.log(correlator.getId()); // some `some uuid`
  },
});
```

### `bindId([id,] work)`

Returns function `work` bound with a correlation scope. When `work` is executed all calls to `getId()` will return the same id. The id for the context may be set explicitly with the optional `correlationId` parameter, otherwise it will be a v4 uuid. Arguments passed to the bound function will be applied to `work`.

```javascript
const boundFn = correlator.bindId({
  fn: (name: string) => `meow-meow, ${name}, ${correlator.getId()}`,
});
boundFn("John"); // meow-meow, John, `some uuid`

const boundFn2 = correlator.bindId({
  correlationId: 'bark'
  fn: (name: string) => `meow-meow, ${name}, ${correlator.getId()}`,
});
boundFn2("John"); // meow-meow, John, `bark`
```
