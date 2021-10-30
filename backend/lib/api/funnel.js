const BackendStateEnum = require('../types/BackendState');
const error = require('../errors');
const {
  AuthController,
  ClockController,
  UserController,
  WorkingTimeController,
} = require('./controllers');
const Router = require('../core/network/router');

class Funnel {
  constructor () {
    this.controllers = new Map();
    this.backend = null;
  }

  init (backend) {
    this.backend = backend;
    this.controllers.set('auth', new AuthController());
    this.controllers.set('user', new UserController());
    this.controllers.set('clock', new ClockController());
    this.controllers.set('workingTime', new WorkingTimeController());

    for (const [controllerName, controller] of this.controllers) {
      for (const route of controller.__actions) {
        const path = route.path[0] === '/' ? `/${controllerName}${route.path}` : `/${controllerName}/${route.path}`
        this.backend.router.attach(route.verb, path, controller[route.action].bind(controller));
      }
    }

    // Wait for all controllers to be initialized
    return Promise.all(
      Array.from(this.controllers.values()).map(controller => controller.init())
    );
  }

  execute (req, callback) {
    if (this.backend.state === BackendStateEnum.SHUTTING_DOWN) {
      return callback(error.getError('request:discarded:shutdown'));
    }

    this.checkRights(req).then(() => {
      return this.backend.router.execute(req).then(result => {
        req.setResult(result);
        callback(null, req);
      });
    }).catch(err => {
      callback(err);
    });
  }

  async checkRights (req) {
    
  }
};

module.exports = Funnel;