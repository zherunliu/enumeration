/*
类似 lodash 库中的 _.throttle(func, [wait=0], [options=])
[options.leading=true] 指定调用在回流开始前
[options.trailing=true] 指定调用在回流开始后
*/

function myThrottle(func, wait = 0) {
  let timer;
  // 返回节流的新函数，并保证参数可使用
  return function (...args) {
    // 保证 this 正常使用
    if (timer) return;
    let _this = this;
    timer = setTimeout(function () {
      func.apply(_this, args);
      timer = undefined;
    }, wait);
  };
}
