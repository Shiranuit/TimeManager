const BackendStateEnum = require('../types/BackendState');
const error = require('../errors');
const {
  AuthController,
  ClockController,
  UserController,
  WorkingTimeController,
} = require('./controllers');
const Router = require('../core/network/router');
const InternalError = require('../errors/internalError');
const User = require('../model/user');

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
    this.controllers.set('workingtime', new WorkingTimeController());

    for (const [controllerName, controller] of this.controllers) {
      for (const route of controller.__actions) {
        const path = route.path[0] === '/' ? `/${controllerName}${route.path}` : `/${controllerName}/${route.path}`;
        if (!controller[route.action] || typeof controller[route.action] !== 'function') {
          throw new InternalError(`Cannot attach path ${route.verb.toUpperCase()} ${path}: no action ${route.action} for controller ${controllerName}`);
        }
        this.backend.router.attach(route.verb, path, controller[route.action].bind(controller), controllerName, route.action);
      }
    }

    return Promise.all(
      Array.from(this.controllers.values()).map(controller => controller.init(backend))
    );
  }

  execute (req, callback) {
    if (this.backend.state === BackendStateEnum.SHUTTING_DOWN) {
      return callback(error.getError('request:discarded:shutdown'));
    }

    this.checkRights(req).then(() => {
      return req.routerPart.handler(req).then(result => {
        req.setResult(result);
        callback(null, req);
      });
    }).catch(err => {
      callback(err);
    });
  }

  async checkRights (req) {
    const token = await this.backend.ask('core:security:token:verify', req.getJWT());
    req.context.user = token ? new User(token.userId) : new User(null);
  }
};

module.exports = Funnel;