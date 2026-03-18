/* 泛型约束 */

type DeepReadonly<T> = T extends Function
  ? T // 函数类型
  : T extends object
    ? { readonly [K in keyof T]: DeepReadonly<T[K]> } // 对象/数组类型，递归处理每个属性
    : T; // 基础类型
