let activeEffect;
export const myEffect = (fn) => {
  const effect = function () {
    activeEffect = effect;
    fn();
  };
  effect();
};
const targetMap = new WeakMap();
export const track = (target, key) => {
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    depsMap = new Map();
    targetMap.set(target, depsMap);
  }
  let deps = depsMap.get(key);
  if (!deps) {
    deps = new Set();
    depsMap.set(key, deps);
  }
  deps.add(activeEffect);
};
export const trigger = (target, key) => {
  const depsMap = targetMap.get(target);
  const deps = depsMap.get(key);
  deps.forEach((effect) => effect());
};
//# sourceMappingURL=myEffect.js.map
