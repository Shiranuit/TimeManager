const sinon = require('sinon');

class BackendMock {
  constructor(config = {}) {
    this.onAsk = sinon.stub();
    this.ask = sinon.stub();
    this.start = sinon.stub();
    this.shutdown = sinon.stub();
    this.config = config;
  }
}

module.exports = BackendMock;