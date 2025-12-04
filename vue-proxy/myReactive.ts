import { track, trigger } from "./myEffect";
const isObject = <T extends object>(target: T) =>
  target !== null && typeof target === "object";
export const myReactive = <T extends object>(target: T) => {
  return new Proxy(target, {
    get(target, key, receiver) {
      let res = Reflect.get(target, key, receiver) as object;
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
