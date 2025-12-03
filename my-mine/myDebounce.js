/* 类似 lodash 库中的 _.debounce(func, [wait=0], [options=]) */

function myDebounce(func, wait = 0) {
  let timer;
  // 返回防抖的新函数，并保证参数可使用
  return function (...args) {
    // 保证 this 正常使用
    let _this = this;
    clearTimeout(timer);
    timer = setTimeout(function () {
      func.apply(_this, args);
    }, wait);
  };
}
