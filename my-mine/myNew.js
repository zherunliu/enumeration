function myNew(Constructor, ...args) {
  // const obj = {};
  // obj.__proto__ = Constructor.prototype;
  const obj = Object.create(Constructor.prototype);

  const result = Constructor.apply(obj, args);
  return result instanceof Object ? result : obj;
}
