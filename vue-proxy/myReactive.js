import { track, trigger } from "./myEffect.js";
const isObject = (target) => target !== null && typeof target === "object";
export const myReactive = (target) => {
  return new Proxy(target, {
    get(target, key, receiver) {
      let res = Reflect.get(target, key, receiver);
      track(target, key);
      if (isObject(res)) {
        return myReactive(res);
      }
      return res;
    },
    set(target, key, value, receiver) {
      let res = Reflect.set(target, key, value, receiver);
      trigger(target, key);
      return res;
    },
  });
};
//# sourceMappingURL=myReactive.js.map
