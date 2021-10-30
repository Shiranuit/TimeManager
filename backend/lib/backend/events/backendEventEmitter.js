const EventEmitter = require('events');

class BackendEventEmitter extends EventEmitter {
  constructor () {
    super();
    this.ask = new Map();
    this.pipe = new Map();
  }

  onAsk (event, fn) {
    assert(typeof fn === 'function', `Cannot listen to ask event "${event}": "${fn}" is not a function`);
    assert(!this.ask.has(event), `Cannot add a listener to the ask event "${event}": event has already an answerer`);

    this.ask.set(event, fn);
  }

  async ask (event, ...payload) {
    if (!this.ask.has(event)) {
      throw new Error(`Cannot ask event "${event}": no listener`);
    }

    const fn = this.ask.get(event);

    return await fn(...payload);
  }

  async onPipe (event, fn) {
    assert(typeof fn === 'function', `Cannot listen to pipe event ${event}: "${fn}" is not a function`);

    if (this.pipe.has(event)) {
      this.pipe.get(event).push(fn);
      return;
    }

    this.pipe.set(event, [fn]);
  }

  async pipe (event, ...payload) {
    if (!this.ask.has(event)) {
      return;
    }

    let pipeData = data;
    for (const fn of this.ask.get(event)) {
      pipeData = await new Promise((res, rej) => {
        return fn(pipeData);
      });
    }
    return pipeData
  }

}

module.exports = BackendEventEmitter;