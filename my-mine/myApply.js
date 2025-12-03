Function.prototype.myApply = function (thisArg, args) {
  // 设置 this
  const f = Symbol();
  thisArg[f] = this;
  const res = thisArg[f](...args); // 调用原函数
  delete this[f]; // 删除 this 的原函数属性
  return res; // 返回原函数返回值
};

function add(...args) {
  console.log(this);
  return args.reduce((prev, cur) => prev + cur, 0);
}

rico = { dislike: "JavaScript" };
console.log(add.myApply(rico, [1, 3]));
