const ClockRepository = require('./clockRepository');

class RepositoryModule {
  constructor () {
    this.backend = null;
    this.clock = new ClockRepository(this);
  }

  async init (backend) {
    this.backend = backend;
    await this.clock.init(backend);
  }
}

module.exports = RepositoryModule;