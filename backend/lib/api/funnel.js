'use strict';

const BackendStateEnum = require('../types/BackendState');
const error = require('../errors');
const {
  AuthController,
  ClockController,
  SecurityController,
  WorkingTimeController,
} = require('./controllers');

const InternalError = require('../errors/internalError');
const User = require('../model/user');

class Funnel {
  constructor () {
    this.controllers = new Map();
    this.backend = null;
  }

  init (backend) {
    this.backend = backend;
    /**
     * Declare the controllers with their names
     * @type {Map<string, BaseController>}
     */
    this.controllers.set('auth', new AuthController());
    this.controllers.set('security', new SecurityController());
    this.controllers.set('clock', new ClockController());
    this.controllers.set('workingtime', new WorkingTimeController());

    /**
     * Create every routes for each controller
     */
    for (const [controllerName, controller] of this.controllers) {
      for (const route of controller.__actions) {
        // If a / is missing at the start of the path we add it
        const path = route.path[0] === '/' ? `/${controllerName}${route.path}` : `/${controllerName}/${route.path}`;

        if (!controller[route.action] || typeof controller[route.action] !== 'function') {
          throw new InternalError(`Cannot attach path ${route.verb.toUpperCase()} /api/${path}: no action ${route.action} for controller ${controllerName}`);
        }
        // Add the route to the router
        this.backend.router.attach(route.verb, `/api/${path}`, controller[route.action].bind(controller), controllerName, route.action);
      }
    }

    // Wait for every controllers to be initialized
    return Promise.all(
      Array.from(this.controllers.values()).map(controller => controller.init(backend))
    );
  }

  /**
   * Process the request, check rights, and call the controller
   * @param {Request} req
   * @param {callback} callback
   * @returns {void}
   */
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

  /**
   * Verify if the user is logged in and has the right to access the controller actions
   * @param {Request} req
   */
  async checkRights (req) {
    const token = await this.backend.ask('core:security:token:verify', req.getJWT());
    req.context.user = token ? new User(token.userId) : new User(null);
  }
}

module.exports = Funnel;