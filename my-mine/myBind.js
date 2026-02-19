Function.prototype.myBind = function (thisArg, ...args) {
  const originalFunc = this;
  if (typeof originalFunc !== "function") {
    throw new TypeError(`${this} is not a function`);
  }

  const boundFunc = function (...innerArgs) {
    // 合并绑定和新传入的参数
    const totalArgs = args.concat(innerArgs);

    // 判断是否通过 new 调用
    // 原理：new 调用时，this 是新创建的实例对象，继承自 boundFunc.prototype
    // 普通调用时，this 是传入的 thisArg 或 window/undefined
    if (this instanceof boundFunc) {
      // new 调用：忽略传入的 thisArg，使用 new 创建的 this
      // 直接调用原函数的构造器，让 this 指向新实例
      return originalFunc.apply(this, totalArgs);
    } else {
      // 普通调用：使用绑定的 thisArg
      return originalFunc.apply(thisArg, totalArgs);
    }
  };

  // 维护原型链：让 boundFunc.prototype 继承 originalFunc.prototype
  // 这样 new boundFunc() 创建的实例也能正确继承原函数的原型
  if (originalFunc.prototype) {
    // 使用中间函数避免修改原函数的 prototype
    boundFunc.prototype = Object.create(originalFunc.prototype);
  }

  return boundFunc;
};

function add(...args) {
  console.log(this);
  return args.reduce((prev, cur) => prev + cur, 0);
}

rico = { dislike: "JavaScript" };
const boundAdd = add.myBind(rico, 1, 2);
console.log(boundAdd(3, 4));

function Person(name) {
  this.name = name;
}

const BoundPerson = Person.myBind({ name: "ignore" });

/**
 * new 调用函数的过程：
 * 1. 创建一个新的空对象。
 * 2. 将这个新对象的 __proto__ 指向函数的 prototype。
 * 3. 将函数内部的 this 指向这个新对象，并执行函数体。
 * 4. 如果函数返回一个对象，则 new 表达式的结果是这个对象；否则，结果是创建的新对象。
 *
 * 在上面的代码中，BoundPerson 是通过 myBind 创建的绑定函数。当我们使用 new BoundPerson("alice") 时：
 * - 创建了一个新的空对象 personInstance。
 * - personInstance.__proto__ 被设置为 BoundPerson.prototype，而 BoundPerson.prototype 又继承自 Person.prototype。
 * - Person 函数被调用，this 指向 personInstance，name 属性被设置为 "alice"。
 * - 因为 Person 没有返回对象，所以 new 表达式的结果是 personInstance。
 *
 * 因此，personInstance.name 输出 "alice"，并且 personInstance instanceof Person 和 personInstance instanceof BoundPerson 都为 true，因为它们共享同一个原型链。
 */

const personInstance = new BoundPerson("alice");
console.log(personInstance.name);
console.log(personInstance instanceof Person);
console.log(personInstance instanceof BoundPerson);
