/* 寄生组合继承（es5 without class） */

function Person(name) {
  this.name = name;
}

Person.prototype.sayHi = function () {
  console.log("Hello from Person");
};

// 通过构造函数继承属性
function Student(name) {
  Person.call(this, name);
}

// 通过原型链继承方法
// Object.create 将一个对象作为原型，创建一个新对象
// 参数1：源对象 参数2：覆盖源对象中的特定属性/方法
const prototype = Object.create(Person.prototype, {
  constructor: {
    value: Student,
  },
});

Student.prototype = prototype;
