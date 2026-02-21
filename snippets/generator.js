/* generator 模拟 async/await */
function run(gen) {
  const it = gen();
  function step(value) {
    const result = it.next(value);
    return handleResult(result);
  }
  function handleResult(result) {
    if (result.done) {
      return Promise.resolve(result.value);
    }
    // 使用 promise 链式调用来处理异步操作
    return Promise.resolve(result.value)
      .then(step)
      .catch((err) => {
        const throwResult = it.throw(err);
        return handleResult(throwResult);
      });
  }
  return step();
}

// example usage
function delay(ms, value) {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function rejectDelay(ms, error) {
  return new Promise((_, reject) =>
    setTimeout(() => reject(new Error(error)), ms),
  );
}

function* generatorExample() {
  try {
    console.log("generator...");

    const result1 = yield delay(1000, "one");
    console.log("generator:", result1);

    const result2 = yield delay(500, "two");
    console.log("generator:", result2);

    try {
      const result3 = yield rejectDelay(300, "error");
    } catch (error) {
      console.log("catch error from generator:", error.message);
    }

    const finalResult = yield delay(200, "three");
    console.log("generator:", finalResult);

    return "generator execution completed";
  } catch (error) {
    console.log("generator error:", error.message);
    throw error;
  }
}

async function asyncExample() {
  try {
    console.log("async...");

    const result1 = await delay(1000, "one");
    console.log("async:", result1);

    const result2 = await delay(500, "two");
    console.log("async:", result2);

    try {
      const result3 = await rejectDelay(300, "error");
    } catch (error) {
      console.log("catch error from async:", error.message);
    }

    const finalResult = await delay(200, "three");
    console.log("async:", finalResult);

    return "async execution completed";
  } catch (error) {
    console.log("async error:", error.message);
    throw error;
  }
}

run(generatorExample)
  .then((result) => {
    console.log("final result of generator:", result);
    return asyncExample();
  })
  .then((result) => {
    console.log("final result of async:", result);
  });
