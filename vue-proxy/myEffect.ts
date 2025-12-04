let activeEffect: Function;
export const myEffect = (fn: Function) => {
  const effect = function () {
    activeEffect = effect;
    fn();
  };
  effect();
};

const targetMap = new WeakMap<object, Map<string | symbol, Set<Function>>>();
export const track = (target: object, key: string | symbol) => {
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    depsMap = new Map<string | symbol, Set<Function>>();
    targetMap.set(target, depsMap);
  }
  let deps = depsMap.get(key);
  if (!deps) {
    deps = new Set<Function>();
    depsMap.set(key, deps);
  }
  deps.add(activeEffect);
};

export const trigger = (target: object, key: string | symbol) => {
  const depsMap = targetMap.get(target);
  const deps = depsMap!.get(key)!;
  deps.forEach((effect) => effect());
};
