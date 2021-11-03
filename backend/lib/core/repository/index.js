'use strict';

const ClockRepository = require('./clockRepository');
const WorkingTimeRepository = require('./workingTimeRepository');

class RepositoryModule {
  constructor () {
    this.backend = null;
    this.clock = new ClockRepository(this);
    this.workingtimes = new WorkingTimeRepository(this);
  }

  /**
   * Initialize all the repositories
   * @param {Backend} backend
   */
  async init (backend) {
    this.backend = backend;
    await this.clock.init(backend);
    await this.workingtimes.init(backend);
  }
}

module.exports = RepositoryModule;