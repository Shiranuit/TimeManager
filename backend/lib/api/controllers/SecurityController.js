'use strict';

const BaseController = require('./BaseController');
const error = require('../../errors');

const EMAIL_PATTERN = /^[A-z0-9_-]+(\.[A-z0-9_-]+)*@[A-z0-9_-]+(\.[A-z0-9_-]+)*\.[A-z0-9_-]+$/;

class SecurityController extends BaseController {
  constructor () {
    super([
      { verb: 'get', path: '/_list', action: 'listUsers' },
      { verb: 'get', path: '/:userId', action: 'getUser' },
      { verb: 'post', path: '/', action: 'createUser' },
      { verb: 'put', path: '/:userId', action: 'updateUser' },
      { verb: 'delete', path: '/:userId', action: 'deleteUser' },
      { verb: 'put', path: '/:userId/_role', action: 'updateUserRole' },
    ]);
  }

  /**
   * Initialize the controller.
   * @param {Backend} backend
   */
  async init (backend) {
    super.init(backend);
    this.config = backend.config.auth;
    this.permissions = backend.config.permissions;
  }

  /**
   * List all the users.
   *
   * @returns {Promise<Array<User>>}
   */
  async listUsers() {
    return await this.backend.ask('core:security:user:list');
  }

  /**
   * Get user informations for a given user.
   *
   * @param {Request} req
   * @returns {Promise<User>}
   */
  async getUser(req) {
    const userId = req.getInteger('userId');

    const user = await this.backend.ask('core:security:user:get', userId);

    if (!user) {
      error.throwError('security:user:with_id_not_found', userId);
    }

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };
  }

  /**
   * Create a user.
   *
   * @param {Request} req
   * @returns {Promise<User>}
   */
  async createUser(req) {
    const username = req.getBodyString('username');
    const email = req.getBodyString('email');
    const password = req.getBodyString('password');

    if (!EMAIL_PATTERN.test(email)) {
      error.throwError('request:invalid:email_format');
    }

    if (username.length < this.config.username.minLength) {
      error.throwError('security:user:username_too_short', this.config.username.minLength);
    }

    try {
      const user = await this.backend.ask('core:security:user:create', { username, email, password });

      if (!user) {
        error.throwError('security:user:creation_failed');
      }

      return {
        id: user.id,
        username: user.username,
        email: user.email,
      };
    } catch (err) {
      if (err.code) {
        if (err.code === '23505') {
          if (err.constraint === 'unique_username') {
            error.throwError('security:user:username_taken');
          } else if (err.constraint === 'unique_email') {
            error.throwError('security:user:email_taken');
          }
        }
      }
      throw err;
    }
  }

  /**
   * Update user informations for a given user.
   *
   * @param {Request} req
   * @returns {Promise<User>}
   */
  async updateUser(req) {
    const userId = req.getInteger('userId');

    const userInfos = await this.backend.ask('core:security:user:get', userId);

    // Should never happen but just in case
    if (!userInfos) {
      error.throwError('security:user:not_found', userId);
    }

    const body = req.getBody();

    if (body.email) {
      if (!EMAIL_PATTERN.test(body.email)) {
        error.throwError('request:invalid:email_format');
      }
    }

    if (body.username) {
      if (body.username.length < this.config.username.minLength) {
        error.throwError('security:user:username_too_short', this.config.username.minLength);
      }
    }

    const sanitizeBody = JSON.parse(JSON.stringify({
      email: body.email,
      username: body.username,
    }));

    try {
      const user = await this.backend.ask('core:security:user:update', userId, {...userInfos, ...sanitizeBody});

      if (!user) {
        error.throwError('security:user:update_failed');
      }

      return {
        id: user.id,
        username: user.username,
        email: user.email,
      };
    } catch (err) {
      if (err.code) {
        if (err.code === '23505') {
          if (err.constraint === 'unique_username') {
            error.throwError('security:user:username_taken');
          } else if (err.constraint === 'unique_email') {
            error.throwError('security:user:email_taken');
          }
        }
      }
      throw err;
    }
  }

  /**
   * Update the role of a given user.
   *
   * @param {Request} req
   * @returns {Promise<User>}
   */
  async updateUserRole(req) {
    const userId = req.getInteger('userId');

    const userInfos = await this.backend.ask('core:security:user:get', userId);

    // Should never happen but just in case
    if (!userInfos) {
      error.throwError('security:user:not_found', userId);
    }

    const role = req.getBodyString('role').toLowerCase();

    if (!this.permissions[role] || role === 'anonymous') {
      const roles = Object.keys(this.permissions).filter(_role => _role !== 'anonymous');
      error.throwError('security:user:invalid_role', role, `[${roles.join(', ')}]`);
    }

    const sanitizeBody = JSON.parse(JSON.stringify({
      role,
    }));

    const user = await this.backend.ask('core:security:user:update', userId, {...userInfos, ...sanitizeBody});

    if (!user) {
      error.throwError('security:user:update_failed');
    }

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };
  }

  /**
   * Delete a given user
   *
   * @param {Request} req
   * @returns {Promise<boolean>}
   */
  async deleteUser(req) {
    const userId = req.getInteger('userId');

    await this.backend.ask('core:security:user:delete', userId);

    return true;
  }

}

module.exports = SecurityController;