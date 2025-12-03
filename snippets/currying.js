/* 函数柯里化（Currying）是一种函数式编程技巧，核心思想是将接收多个参数的函数，转化为一系列只接收单一参数（或部分参数）的函数链，最终通过多次调用累加参数并执行原函数逻辑 */

function sumMaker(length) {
  let nums = [];
  return function sum(...args) {
    nums.push(...args);
    if (nums.length >= length) {
      const res = nums.slice(0, length).reduce((prev, cur) => prev + cur, 0);
      nums = [];
      return res;
    } else {
      return sum;
    }
  };
}

sum4 = sumMaker(4);
console.log(sum4(1, 2)(3, 4)); // 10

const typeOfTest = (type) => (thing) => typeof thing === type;
const isString = typeOfTest("string");
console.log(isString("hello")); // true
console.log(isString(123)); // false
