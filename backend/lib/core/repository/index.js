'use strict';

const ClockRepository = require('./clockRepository');
const TeamRepository = require('./teamRepository');
const WorkingTimeRepository = require('./workingTimeRepository');

class RepositoryModule {
  constructor () {
    this.backend = null;
    this.clock = new ClockRepository(this);
    this.workingtime = new WorkingTimeRepository(this);
    this.team = new TeamRepository(this);
  }

  /**
   * Initialize all the repositories
   * @param {Backend} backend
   */
  async init (backend) {
    this.backend = backend;
    await this.clock.init(backend);
    await this.workingtime.init(backend);
    await this.team.init(backend);
  }
}

module.exports = RepositoryModule;