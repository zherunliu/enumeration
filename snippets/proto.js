// 原型链案例：实现 new 操作
function myNew(constructor_, ...args) {
  const obj = Object.create(constructor_.prototype);
  const ret = constructor_.apply(obj /* this */, args);
  return typeof ret === "object" && ret !== null ? ret : obj;
}

/*
  原型链
  prototype 原型对象
  - prototype 是【函数】的属性
  - prototype 是一个对象
  - 创建函数的时候会默认添加 prototype 属性

  __proto__ 隐式原型
  - __proto__ 是【对象】的属性
  - 指向构造函数的 prototype
  - demo.__proto__ = Demo.prototype
 */

function Demo(name, age) {
  this.name = name;
  this.age = age;
  this.say = function () {
    console.log(this.name, this.age);
  };
}

Demo.prototype.name2 = "aaa";
Demo.prototype.age2 = 22;
Demo.prototype.say2 = function () {
  console.log(this.__proto__.name2, this.__proto__.age2);
};

// 类的数据类型就是函数 类本身就指向构造函数 类的所有方法都定义在类的 prototype 属性上面
console.log(Demo, "@", Demo.prototype, "@", Demo.__proto__);

const demo = myNew(Demo /** constructor_ */, "bbb" /** name */, 23 /** age */);
console.log(demo, "@", demo.prototype, "@", demo.__proto__);
console.log(demo.name, demo.name2); // bbb aaa
console.log(demo.age, demo.age2); // 23 22
demo.say(); // bbb 23
demo.say2(); // aaa 22

Demo.prototype.name2 = "ccc";
Demo.prototype.age2 = 24;
demo.say2(); // ccc 24

/**
 * demo {
 *   name: 'bbb',
 *   age: 23,
 *   say()
 *   __proto__: Demo.prototype = {
 *     name2: 'aaa'
 *     age2: 22
 *     say2()
 *     __proto__: Object.prototype = {
 *       __proto__: null
 *     }
 *   }
 * }
 */
console.log(Demo.prototype === demo.__proto__); // true ok 对象的__proto__指向构造函数的 prototype
console.log(Demo.prototype); // prototype 是一个函数属性对象

console.log(Demo.prototype.constructor === Demo); // true ok
console.log(demo.__proto__.constructor === Demo); // true ok

console.log(demo.constructor === Demo); // true ok

console.log(Demo.constructor);
console.log(demo.constructor);
