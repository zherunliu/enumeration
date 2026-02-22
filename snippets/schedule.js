/* 并发控制调度器 */
class Schedule {
  constructor(max) {
    this.max = max;
    this.running = [];
    this.queue = [];
  }
  add(task) {
    return new Promise((resolve) => {
      this.queue.push({ task, resolve });
      this.run();
    });
  }
  run() {
    while (this.running.length < this.max && this.queue.length) {
      const { task, resolve } = this.queue.shift();
      const promise = task().then((result) => {
        resolve(result);
        return result;
      });
      this.running.push(promise);

      promise.finally(() => {
        this.running.splice(this.running.indexOf(promise), 1);
        this.run();
      });
    }
  }
}
