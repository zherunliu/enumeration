const compose =
  (...fns) =>
  (...args) => {
    return fns.reduceRight((v, f) => {
      return Array.isArray(v) ? f(...v) : f(v);
    }, args);
  };

const pipe =
  (...fns) =>
  (...args) => {
    return fns.reduce((v, f) => {
      return Array.isArray(v) ? f(...v) : f(v);
    }, args);
  };

const add = (x) => x + 1;
const mul = (x) => x * 2;
const sub = (x) => x - 3;

const composedFn = compose(add, mul, sub);
const pipedFn = pipe(add, mul, sub);

console.log(composedFn(6)); // 7
console.log(pipedFn(6)); // 11

const swap = (a, b) => [b, a];
const update = (a, b) => [a + 1, b - 1];

const composedPairFn = compose(swap, update);
const pipedPairFn = pipe(swap, update);

console.log(composedPairFn(2, 3)); // [2, 3]
console.log(pipedPairFn(2, 3)); // [4, 1]
