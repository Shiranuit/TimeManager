'use strict';

const BaseController = require('./BaseController');
const error = require('../../errors');
const ms = require('ms');

const EMAIL_PATTERN = /^[A-z0-9_-]+(\.[A-z0-9_-]+)*@[A-z0-9_-]+(\.[A-z0-9_-]+)*\.[A-z0-9_-]+$/;
const CAPITAL_PATTERN = /[A-Z]/;
const NUMBER_PATTERN = /[0-9]/;
const LOWER_PATTERN = /[a-z]/;

class AuthController extends BaseController {
  constructor () {
    super([
      { verb: 'post', path: '/_login', action: 'login' },
      { verb: 'get', path: '/_logout', action: 'logout' },
      { verb: 'post', path: '/_register', action: 'register' },
      { verb: 'post', path: '/_checkToken', action: 'checkToken' },

      { verb: 'get', path: '/_me', action: 'getMyUser'},
      { verb: 'put', path: '/', action: 'updateMyUser' },
      { verb: 'delete', path: '/', action: 'deleteMyUser' },
    ]);
  }

  async init (backend) {
    super.init(backend);
    this.config = backend.config.auth;
  }

  async login (req) {
    const username = req.getBodyString('username').toLowerCase();
    const password = req.getBodyString('password');
    const expiresIn = req.getString('expiresIn', '1h');

    const user = await this.backend.ask('core:security:user:verify', {
      username,
      password,
    });

    if (!user) {
      error.throwError('security:user:invalid_credentials');
    }

    const token = await this.backend.ask('core:security:token:create', user, { expiresIn: ms(expiresIn) });

    if (!token) {
      error.throwError('security:token:creation_failed');
    }

    return {
      id: token.userId,
      jwt: token.jwt,
      ttl: token.ttl,
      expiresAt: token.expiresAt,
    };
  }

  async logout (req) {
    await this.backend.ask('core:security:token:delete', req.getJWT());

    return true;
  }

  async register (req) {
    const username = req.getBodyString('username').toLowerCase();
    const email = req.getBodyString('email');
    const password = req.getBodyString('password');

    if (!EMAIL_PATTERN.test(email)) {
      error.throwError('request:invalid:email_format');
    }

    if (username.length < this.config.username.minLength) {
      error.throwError('security:user:username_too_short', this.config.username.minLength);
    }

    if (password.length < this.config.password.minLength) {
      error.throwError('security:user:password_too_short', this.config.password.minLength);
    }

    if (!CAPITAL_PATTERN.test(password) || !LOWER_PATTERN.test(password) || !NUMBER_PATTERN.test(password)) {
      error.throwError('security:user:password_too_weak');
    }

    try {
      const user = await this.backend.ask('core:security:user:create', {
        username,
        email,
        password,
      });

      if (!user) {
        error.throwError('security:user:creation_failed');
      }

      const token = await this.backend.ask('core:security:token:create', {
        username,
        password,
      });

      return {
        id: user.id,
        jwt: token,
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

  async checkToken (req) {
    const token = await this.backend.ask('core:security:token:verify', req.getJWT());

    if (!token) {
      return {
        id: null,
        expiresIn: -1,
        expiresAt: -1,
      };
    }

    return {
      id: token.userId,
      ttl: token.ttl,
      expiresAt: token.expiresAt,
    };
  }

  async getMyUser (req) {
    if (req.isAnonymous()) {
      error.throwError('security:user:not_authenticated');
    }

    return await this.backend.ask('core:security:user:get', req.getUser().id);
  }

  async updateMyUser (req) {
    if (req.isAnonymous()) {
      error.throwError('security:user:not_authenticated');
    }

    const userInfos = await this.backend.ask('core:security:user:get', req.getUser().id);

    // Should never happen but just in case
    if (!userInfos) {
      error.throwError('security:user:not_found', req.getUser().id);
    }

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

    const body = req.getBody();
    const sanitizeBody = JSON.parse(JSON.stringify({
      email: body.email,
      username: body.username,
    }));

    try {
      const user = await this.backend.ask('core:security:user:update', req.getUser().id, {...userInfos, ...sanitizeBody});

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

  async deleteMyUser (req) {
    if (req.isAnonymous()) {
      error.throwError('security:user:not_authenticated');
    }

    return await this.backend.ask('core:security:user:delete', req.getUser().id);
  }
}

module.exports = AuthController;