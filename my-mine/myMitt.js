/**
 * @callback TCallback
 * @param {...unknown} args
 * @returns {void}
 */

class MyMitt {
  constructor() {
    /**
     * @type {Map<string, Map<string, Set<TCallback>>}
     */
    this.namespaces = new Map();
    this.DEFAULT_NS = "global";
  }

  /**
   * @private
   */
  _getBus(ns = this.DEFAULT_NS) {
    if (!this.namespaces.has(ns)) {
      this.namespaces.set(ns, new Map());
    }
    return this.namespaces.get(ns);
  }

  /**
   * @param {string} type
   * @param {TCallback} callback
   * @param {string} [ns]
   * @return {()=>void} 自动解绑函数
   */
  on(type, callback, ns = this.DEFAULT_NS) {
    const bus = this._getBus(ns);
    const handlers = bus.get(type) || new Set();
    handlers.add(callback);
    bus.set(type, handlers);

    return () => this.off(type, callback, ns);
  }

  /**
   * @param {string} type
   * @param {TCallback} callback
   * @param {string} [ns]
   */
  off(type, callback, ns = this.DEFAULT_NS) {
    const bus = this.namespaces.get(ns);
    if (!bus) return;

    const handlers = bus.get(type);
    if (handlers) {
      handlers.delete(callback);
      if (handlers.size === 0) {
        bus.delete(handlers);
      }
    }

    if (bus.size === 0) {
      this.namespaces.delete(ns);
    }
  }

  /**
   * @param {string} type
   * @param {string} [ns]
   * @param  {...unknown} args
   */
  emit(type, ns = this.DEFAULT_NS, ...args) {
    const bus = this.namespaces.get(ns);
    // 使用 Array.from 避免回调中有 off 操作导致 Set 遍历死循环
    if (bus && bus.has(type)) {
      Array.from(bus.get(type)).forEach((callback) => callback(...args));
    }
  }

  /**
   * @param {type} type
   * @param {TCallback} callback
   * @param {string} ns
   */
  once(type, callback, ns = this.DEFAULT_NS) {
    const wrappedCallback = (...args) => {
      callback(...args);
      this.off(type, wrappedCallback, ns);
    };
    this.on(type, wrappedCallback, ns);
  }

  /**
   * @param {string} ns
   */
  clearNamespace(ns = this.DEFAULT_NS) {
    this.namespaces.delete(ns);
  }

  clear() {
    this.namespaces.clear();
  }
}

export const mitt = new MyMitt();
