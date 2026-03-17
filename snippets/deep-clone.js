function deepClone(target, map = new WeakMap()) {
  if (target === null || typeof target !== "object") {
    return target;
  }

  // 避免循环引用，对象类型使用 WeakMap 更合适
  if (map.has(target)) {
    return map.get(target);
  }

  const cloneTarget = Array.isArray(target) ? [] : {};
  map.set(target, cloneTarget);

  for (const key in target) {
    // 只克隆对象自身的属性，不克隆原型链上的属性
    if (target.hasOwnProperty(key)) {
      cloneTarget[key] = deepClone(target[key], map);
    }
  }

  return cloneTarget;
}
