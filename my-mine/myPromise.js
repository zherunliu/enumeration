/**
 * 1.1 "promise" 有 then 方法的对象或函数，行为符合本规范
 * 1.2 "thenable" 有 then 方法的对象或函数
 * 1.3 "value" 合法的 JS 值（包括 undefined、thenable 或 promise）
 * 1.4 "exception" 使用 throw 语句抛出的值
 * 1.5 "reason" 代表 promise 被拒绝的原因
 */

// 2.1 promise 的三个状态：pending、fulfilled 或 rejected
const PENDING = "pending";
const FULFILLED = "fulfilled";
const REJECTED = "rejected";

class MyPromise {
  // 2.1.1 pending 时
  // 2.1.1.1 promise 可以转为 fulfilled 或 rejected
  state = PENDING;
  result;
  #handlers = []; // [{onFulFilled, onRejected}]

  constructor(func) {
    const resolve = (value) => {
      if (this.state === PENDING) {
        // 2.1.2 fulfilled 时
        // 2.1.2.1 不能转为其他状态
        // 2.1.2.2 必须有一个 value，且不能改变
        this.state = FULFILLED;
        this.result = value;
        // 2.2.6 一个 promise 的 then 方法可以多次调用
        // 2.2.6.1 当 promise fulfilled 时，所有 onFulfilled 回调按顺序执行
        this.#handlers.forEach(({ onFulfilled }) => {
          onFulfilled(this.result);
        });
      }
    };
    const reject = (reason) => {
      if (this.state === PENDING) {
        // 2.1.3 rejected 时
        // 2.1.3.1 不能转为其他状态
        // 2.1.3.2 必须有一个reason，且不能改变
        this.state = REJECTED;
        this.result = reason;
        // 2.2.6.1 当 promise rejected 时，所有 onRejected 回调按顺序执行
        this.#handlers.forEach(({ onRejected }) => {
          onRejected(this.result);
        });
      }
    };
    // 处理实例化异常
    try {
      func(resolve, reject);
    } catch (error) {
      reject(error);
    }
  }

  // 2.2 promise 必须提供 then 方法来访问当前或最终的 value/reason
  // 2.2.1 onFulfilled 和 onRejected 都是可选的
  then(onFulfilled, onRejected) {
    // 2.2.1.1 如果 onFulfilled 不是函数，则忽略它
    // 2.2.7.3 如果 onFulfilled 不是函数且调用 then 方法的promise（promise1） fulfilled，那么 promise2 需要用相同的 value fulfilled
    onFulfilled = typeof onFulfilled === "function" ? onFulfilled : (x) => x;
    // 2.2.1.2 如果 onRejected 不是函数，则忽略它
    // 2.2.7.3 如果 onRejected 不是函数且 promise rejected，那么 promise2 需要用相同的 reason rejected
    onRejected =
      typeof onRejected === "function"
        ? onRejected
        : (x) => {
            throw x;
          };

    // 支持链式调用 创建 Promise 的回调函数是立即执行的
    const promise2 = new MyPromise((resolve, reject) => {
      const onFuncHandler = (onFunc) => {
        runAsyncTask(() => {
          try {
            // 2.2.5 onFulfilled 和 onRejected 必须作为函数调用，即没有 this 值
            let x = onFunc(this.result);
            // 2.2.7.1 如果 onFulfilled 或 onRejected 返回 x，执行 Promise Resolution Procedure
            resolvePromise(promise2, x, resolve, reject);
          } catch (err) {
            // 2.2.7.2 如果 onFulfilled 或 onRejected 抛出异常 err，则以 err 作为 reason reject promise2
            reject(err);
          }
        });
      };

      if (this.state === FULFILLED) {
        // 2.2.2 如果 onFulfilled 是一个函数
        // 2.2.2.1 必须在 promise fulfilled 后调用，并且以 promise 的 value 作为第一个参数
        // 2.2.2.2 在 promise fulfilled 前不能调用
        // 2.2.2.3 不能多次调用
        onFuncHandler(onFulfilled);
      } else if (this.state === REJECTED) {
        // 2.2.3 如果 onRejected 是一个函数
        // 2.2.3.1 必须在 promise rejected 后调用，并且以 promise 的 reason 作为第一个参数
        // 2.2.3.2 在 promise rejected 前不能调用
        // 2.2.3.3 不能多次调用
        onFuncHandler(onRejected);
      } else {
        this.#handlers.push({
          onFulfilled: () => {
            onFuncHandler(onFulfilled);
          },
          onRejected: () => {
            onFuncHandler(onRejected);
          },
        });
      }
    });
    // 2.2.7 then 方法必须返回一个 promise（promise2）
    return promise2;
  }

  catch(onRejected) {
    // 内部调用 then
    return this.then(undefined, onRejected);
  }

  finally(onFinally) {
    return this.then(
      (value) => MyPromise.resolve(onFinally()).then(() => value),
      (reason) =>
        MyPromise.resolve(onFinally()).then(() => {
          throw reason;
        }),
    );
  }

  // #region 静态方法

  // 如果传入的是 Promise 将会直接返回，否则返回兑现的 Promise
  static resolve(value) {
    if (value instanceof MyPromise) {
      return value;
    }
    return new MyPromise((resolve) => {
      resolve(value);
    });
  }

  // 直接返回被拒绝的 Promise
  static reject(value) {
    return new MyPromise((_, reject) => {
      reject(value);
    });
  }

  static race(promises) {
    return new MyPromise((resolve, reject) => {
      if (!Array.isArray(promises)) {
        reject(new TypeError("Argument is not iterable"));
      }
      promises.forEach((p) => {
        MyPromise.resolve(p).then(
          (res) => {
            resolve(res);
          },
          (err) => {
            reject(err);
          },
        );
      });
    });
  }

  static all(promises) {
    return new MyPromise((resolve, reject) => {
      if (!Array.isArray(promises)) {
        reject(new TypeError("Argument is not iterable"));
      }
      // 空数组直接兑现
      promises.length === 0 && resolve(promises);

      const results = [];
      let count = 0;
      promises.forEach((p, index) => {
        MyPromise.resolve(p).then(
          (res) => {
            results[index] = res;
            count++;
            count === promises.length && resolve(results);
          },
          (err) => {
            reject(err);
          },
        );
      });
    });
  }

  static allSettled(promises) {
    return new MyPromise((resolve, reject) => {
      if (!Array.isArray(promises)) {
        reject(new TypeError("Argument is not iterable"));
      }
      // 空数组直接兑现
      promises.length === 0 && resolve(promises);

      const results = [];
      let count = 0;
      promises.forEach((p, index) => {
        MyPromise.resolve(p).then(
          (res) => {
            results[index] = { status: FULFILLED, value: res };
            count++;
            count === promises.length && resolve(results);
          },
          (err) => {
            results[index] = { status: REJECTED, reason: err };
            count++;
            count === promises.length && resolve(results);
          },
        );
      });
    });
  }

  static any(promises) {
    return new MyPromise((resolve, reject) => {
      if (!Array.isArray(promises)) {
        reject(new TypeError("Argument is not iterable"));
      }
      // 空数组直接拒绝
      promises.length === 0 &&
        reject(new AggregateError(promises, "All promises were rejected"));

      const errors = [];
      let count = 0;
      promises.forEach((p, index) => {
        MyPromise.resolve(p).then(
          (res) => {
            resolve(res);
          },
          (err) => {
            errors[index] = err;
            count++;
            count === promises.length &&
              reject(new AggregateError(errors, "All promises were rejected"));
          },
        );
      });
    });
  }
  // #endregion
}

// 2.2.4 onFulfilled 和 onRejected 可以使用 setTimeout，setImmediate 等宏任务实现，也可以使用 queueMicrotask，process.nextTick 等微任务实现
function runAsyncTask(callback) {
  if (typeof queueMicrotask === "function") {
    queueMicrotask(callback);
  } else if (typeof MutationObserver === "function") {
    const obs = new MutationObserver(callback);
    const divNode = document.createElement("div");
    obs.observe(divNode, { childList: true });
    divNode.innerText = "rico";
  } else {
    setTimeout(callback, 0);
  }
}

/** 2.3 Promise Resolution Procedure */
function resolvePromise(promise, x, resolve, reject) {
  // 处理循环引用
  // 2.3.1 如果 promise 和 x 指向同一对象，则以 TypeError 为 reason reject promise
  if (x === promise) {
    throw new TypeError("Chaining cycle detected for promise #<Promise>");
  }
  // 处理返回 Promise 的逻辑
  // 2.3.2 如果 x 是一个 promise，则承接其状态
  // 2.3.2.1 当 x pending 时，promise 应该保持 pending 直到 x fulfilled/rejected
  // 2.3.2.2 当 x fulfilled 时，promise 应该使用相同的 value fulfilled
  // 2.3.2.3 当 x rejected 时，promise 应该使用相同的 reason rejected
  if (x instanceof MyPromise) {
    x.then((y) => {
      resolvePromise(promise, y, resolve, reject);
    }, reject);
    // 2.3.3 如果 x 是一个对象或函数
  } else if (x !== null && (typeof x === "object" || typeof x === "function")) {
    let then;
    try {
      // 2.3.3.1 让 then = x.then
      then = x.then;
    } catch (err) {
      // 2.3.3.2 如果检索 x.then 导致异常 err，则以 err 作为 reason reject promise
      return reject(err);
    }
    // 2.3.3.3 如果 then 是一个函数，则使用 x 作为 this 调用 then 方法，第 1 个参数是 resolvePromise，第 2 个参数是 rejectPromise
    if (typeof then === "function") {
      // 2.3.3.3.3 如果同时调用 resolvePromise 和 rejectPromise，或者对同一参数进行多次调用，则优先处理第一次调用，后续调用被忽略
      let called = false;
      try {
        then.call(
          x,
          // 2.3.3.3.1 如果调用 resolvePromise 并传递 y 时，则使用 y 作为 value，执行 Promise Resolution Procedure
          (y) => {
            if (called) return;
            called = true;
            resolvePromise(promise, y, resolve, reject);
          },
          // 2.3.3.3.2 如果调用 rejectPromise 并传递 r 时，则使用 r 作为 reason reject promise
          (r) => {
            if (called) return;
            called = true;
            reject(r);
          },
        );
        // 2.3.3.3.4 如果调用 then 抛出异常 err
      } catch (err) {
        // 2.3.3.3.4.1 如果已经调用 resolvePromise 或 rejectPromise，则忽略
        if (called) return;
        called = true;
        // 2.3.3.3.4.2 否则，以 err 为 reason reject promise
        reject(err);
      }
    } else {
      // 2.3.3.4 如果 x 不是函数，则用 x 为 value，resolve promise
      resolve(x);
    }
  } else {
    // 2.3.4 如果 x 不是对象或函数，则用 x 为 value，resolve promise
    return resolve(x);
  }
}

// for promises-aplus-tests
MyPromise.deferred = function () {
  let result = {};
  result.promise = new MyPromise((resolve, reject) => {
    result.resolve = resolve;
    result.reject = reject;
  });
  return result;
};

module.exports = {
  resolved: (value) => {
    return MyPromise.resolve(value);
  },
  rejected: (reason) => {
    return MyPromise.reject(reason);
  },
  deferred: () => {
    return MyPromise.deferred();
  },
};
