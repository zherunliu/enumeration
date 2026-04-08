const React = {
  createElement(type, props = {}, ...children) {
    return {
      type,
      props: {
        ...props,
        children: children.map((child) =>
          typeof child === "object" ? child : React.createTextElement(child),
        ),
      },
    };
  },

  createTextElement(text) {
    return {
      type: "TEXT_ELEMENT",
      props: {
        nodeValue: text,
        children: [],
      },
    };
  },
};

let nextUnitOfWork = null; // 下一个工作单元
let currentRoot = null; // 当前 Fiber 树的根
let wipRoot = null; // 正在工作的 Fiber 树
let deletions = null; // 存储需要删除的 Fiber

// Fiber 渲染入口
function render(element, container) {
  wipRoot = {
    dom: container,
    props: {
      children: [element],
    },
    alternate: currentRoot,
  };
  nextUnitOfWork = wipRoot;
  deletions = [];
}

// 创建 Fiber 节点
function createFiber(element, parent) {
  return {
    type: element.type,
    props: element.props,
    parent,
    dom: null, // 关联的 DOM 节点
    child: null, // 子节点
    sibling: null, // 兄弟节点
    alternate: null, // 对应的前一次 Fiber 节点
    effectTag: null, // 'PLACEMENT'，'UPDATE'，'DELETION'
  };
}

// 创建 DOM 节点
function createDom(fiber) {
  const dom =
    fiber.type === "TEXT_ELEMENT"
      ? document.createTextNode("")
      : document.createElement(fiber.type);

  updateDom(dom, {}, fiber.props);
  return dom;
}

// 更新 DOM 节点属性
function updateDom(dom, prevProps, nextProps) {
  // 移除旧属性
  Object.keys(prevProps)
    .filter((name) => name !== "children")
    .forEach((name) => {
      dom[name] = "";
    });

  // 添加新属性
  Object.keys(nextProps)
    .filter((name) => name !== "children")
    .filter((name) => prevProps[name] !== nextProps[name])
    .forEach((name) => {
      dom[name] = nextProps[name];
    });
}

// Fiber 调度器
function workLoop(deadline) {
  let shouldYield = false;

  // 有下一个工作单元，并且当前帧的剩余时间足够执行下一个工作单元，就继续执行
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    //使用 deadline.timeRemaining() 来检查剩余的空闲时间
    shouldYield = deadline.timeRemaining() < 1;
  }

  if (!nextUnitOfWork && wipRoot) {
    commitRoot();
  }

  requestIdleCallback(workLoop);
}

// 处理当前的工作单元，并返回下一个要执行的工作单元
function performUnitOfWork(fiber) {
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }

  // 遍历子节点
  const elements = fiber.props.children;
  reconcileChildren(fiber, elements);

  // 返回下一个工作单元（child，sibling，or parent）
  if (fiber.child) {
    return fiber.child;
  }

  let nextFiber = fiber;
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }
    nextFiber = nextFiber.parent;
  }
  return null;
}

// Diff 算法
function reconcileChildren(wipFiber, elements) {
  let index = 0;
  let oldFiber = wipFiber.alternate && wipFiber.alternate.child;
  let prevSibling = null;

  while (index < elements.length || oldFiber !== null) {
    const element = elements[index];
    let newFiber = null;

    // 比较旧 Fiber 和新元素
    const sameType = oldFiber && element && element.type === oldFiber.type;

    // 复用
    if (sameType) {
      console.log("复用", element.type);
      newFiber = {
        type: oldFiber.type,
        props: element.props,
        dom: oldFiber.dom,
        parent: wipFiber,
        alternate: oldFiber,
        effectTag: "UPDATE",
      };
    }

    // 新增
    if (element && !sameType) {
      console.log("新增", element.type);
      newFiber = createFiber(element, wipFiber);
      newFiber.effectTag = "PLACEMENT";
    }

    // 删除
    if (oldFiber && !sameType) {
      console.log("删除", oldFiber.type);
      oldFiber.effectTag = "DELETION";
      deletions.push(oldFiber);
    }

    if (oldFiber) {
      oldFiber = oldFiber.sibling;
    }

    // 形成链式结构
    if (index === 0) {
      wipFiber.child = newFiber;
    } else if (element) {
      prevSibling.sibling = newFiber;
    }

    prevSibling = newFiber;
    index++;
  }
}

function commitRoot() {
  deletions.forEach(commitWork);
  commitWork(wipRoot.child);
  currentRoot = wipRoot;
  wipRoot = null;
}

function commitWork(fiber) {
  if (!fiber) {
    return;
  }

  const domParent = fiber.parent.dom;

  if (fiber.effectTag === "PLACEMENT" && fiber.dom != null) {
    domParent.appendChild(fiber.dom);
  } else if (fiber.effectTag === "UPDATE" && fiber.dom != null) {
    updateDom(fiber.dom, fiber.alternate.props, fiber.props);
  } else if (fiber.effectTag === "DELETION") {
    domParent.removeChild(fiber.dom);
  }

  commitWork(fiber.child);
  commitWork(fiber.sibling);
}

requestIdleCallback(workLoop);

// 测试
render(
  React.createElement(
    "div",
    { id: 1 },
    React.createElement("span", null, "hello world"),
  ),
  document.getElementById("root"),
);

setTimeout(() => {
  render(
    React.createElement(
      "div",
      { id: 1 },
      React.createElement("p", null, "hello rico"),
    ),
    document.getElementById("root"),
  );
}, 2000);
