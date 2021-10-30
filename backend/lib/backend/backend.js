const BackendEventEmitter = require('./events/backendEventEmitter');
const Funnel = require('../api/funnel');
const EntryPoint = require('../core/network/entrypoint');
const BackendStateEnum = require('../types/BackendState');
const Prom = require('../utils/prom');
const Logger = require('../utils/logger');
const Router = require('../core/network/router');

class Backend extends BackendEventEmitter {

  constructor (config) {
    super();
    this.config = config;
    
    this.funnel = new Funnel();
    this.entryPoint = new EntryPoint();
    this.router = new Router();
    
    this.logger = new Logger();
    this.state = BackendStateEnum.STARTING;
  }

  async start () {
    // Backend is starting
    this.logger.info('Starting backend...');
    await super.pipe('backend:state:start');

    await this.router.init();
    await this.funnel.init(this);
    await this.entryPoint.init(this);

    // Module initialized, requests still not accepted
    await super.pipe('backend:state:live');

    await this.entryPoint.startListening();
    
    // Backend is ready
    await super.pipe('backend:state:ready');
    this.state = BackendStateEnum.RUNNING;
    this.logger.info('Backend has started');
  }

  async shutdown () {
    this.state = BackendStateEnum.SHUTTING_DOWN;
    this.logger.info('Backend is shutting down');
    await super.pipe('backend:shutdown');

    while (this.funnel.remainingRequests !== 0) {
      await Prom.sleep(1000);
    }
  }

}

module.exports = { Backend };