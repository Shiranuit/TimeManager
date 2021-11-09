'use strict';

const BackendStateEnum = require('../types/BackendState');
const error = require('../errors');
const {
  AuthController,
  ClockController,
  SecurityController,
  WorkingTimeController,
  TeamController,
} = require('./controllers');

const InternalError = require('../errors/internalError');
const User = require('../model/user');

class Funnel {
  constructor () {
    this.controllers = new Map();
    this.backend = null;
    this.permissions = {};
  }

  init (backend) {
    this.backend = backend;
    this.permissions = backend.config.permissions;
    /**
     * Declare the controllers with their names
     * @type {Map<string, BaseController>}
     */
    this.controllers.set('auth', new AuthController());
    this.controllers.set('security', new SecurityController());
    this.controllers.set('clock', new ClockController());
    this.controllers.set('workingtime', new WorkingTimeController());
    this.controllers.set('team', new TeamController());

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

    if (req.isAnonymous()) {
      this.backend.logger.debug('Request made as anonymous');
      if (!this.hasPermission('anonymous', req.getController(), req.getAction())) {
        this.backend.logger.debug(`Insufficient permissions to execute ${req.getController()}:${req.getAction()}`);
        error.throwError('security:permission:denied', req.getController(), req.getAction());
      }
    } else {
      const userInfo = await this.backend.ask('core:security:user:get', token.userId);
      this.backend.logger.debug(`Request made as ${userInfo.username} (ID: ${userInfo.id}, role: ${userInfo.role})`);
      if (!this.hasPermission(userInfo.role, req.getController(), req.getAction())) {
        this.backend.logger.debug(`Insufficient permissions to execute ${req.getController()}:${req.getAction()}`);
        error.throwError('security:permission:denied', req.getController(), req.getAction());
      }
    }
  }

  hasPermission(role, controller, action) {
    if (this.permissions[role]) {
      const rolePermissions = this.permissions[role];
      if (rolePermissions['*']) {
        return Boolean(rolePermissions['*']['*'] || rolePermissions['*'][action]);
      }
      if (rolePermissions[controller]) {
        return Boolean(rolePermissions[controller]['*'] || rolePermissions[controller][action]);
      }
    }
    return false;
  }
}

module.exports = Funnel;