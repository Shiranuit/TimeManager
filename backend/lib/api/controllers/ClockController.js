'use strict';

const BaseController = require('./BaseController');
const error = require('../../errors');

class ClockController extends BaseController {
  constructor () {
    super([
      { verb: 'get', path: '/_me', action: 'getMyClock' },
      { verb: 'get', path: '/:userId', action: 'getClock' },

      { verb: 'post', path: '/_me', action: 'createOrUpdateMyClock' },
      { verb: 'post', path: '/:userId', action: 'createOrUpdate' },

      { verb: 'delete', path: '/_me', action: 'deleteMyClock' },
      { verb: 'delete', path: '/:userId', action: 'delete' },
    ]);
  }

  /**
   * Create or update the clock of the current user.
   *
   * @param {Request} req
   * @returns {Promise<Clock>}
   */
  async createOrUpdateMyClock (req) {
    if (req.isAnonymous()) {
      error.throwError('security:user:not_authenticated');
    }

    let clock = await this.backend.ask('core:clock:get', req.getUser().id);

    if (!clock) {
      clock = await this.backend.ask('core:clock:create', req.getUser().id);
      if (!clock) {
        error.throwError('api:clock:creation_failed');
      }
    } else {
      if (clock.status) {
        await this.backend.ask('core:workingtime:create', req.getUser().id, {
          _start: clock.start.toISOString(),
          _end: new Date().toISOString(),
          _description: '',
        });
      } else {
        clock.start = new Date().toISOString();
      }

      clock = await this.backend.ask('core:clock:update', req.getUser().id, { start: clock.start, status: !clock.status });
      if (!clock) {
        error.throwError('api:clock:update_failed');
      }
    }

    return {
      status: clock.status,
      start: clock.start,
    };
  }

  /**
   * Create or update the clock of the given user.
   *
   * @param {Request} req
   * @returns {Promise<Clock>}
   */
  async createOrUpdate (req) {
    const userId = req.getInteger('userId');

    const user = await this.backend.ask('core:security:user:get', userId);

    if (!user) {
      error.throwError('security:user:with_id_not_found', userId);
    }

    let clock = await this.backend.ask('core:clock:get', userId);

    if (!clock) {
      clock = await this.backend.ask('core:clock:create', userId);

      if (!clock) {
        error.throwError('api:clock:creation_failed');
      }
    } else {
      if (clock.status) {
        await this.backend.ask('core:workingtime:create', userId, {
          _start: clock.start.toISOString(),
          _end: new Date().toISOString(),
          _description: '',
        });
      } else {
        clock.start = new Date().toISOString();
      }

      clock = await this.backend.ask('core:clock:update', userId, { start: clock.start, status: !clock.status });
      if (!clock) {
        error.throwError('api:clock:update_failed');
      }
    }

    return {
      status: clock.status,
      start: clock.start,
    };
  }

  /**
   * Get the clock of the current user.
   *
   * @param {Request} req
   * @returns {Promise<Clock>}
   */
  async getMyClock (req) {
    if (req.isAnonymous()) {
      error.throwError('security:user:not_authenticated');
    }

    const clock = await this.backend.ask('core:clock:get', req.getUser().id);

    if (!clock) {
      error.throwError('api:clock:not_found', req.getUser().id);
    }

    return {
      status: clock.status,
      start: clock.start,
    };
  }

  /**
   * Get the clock of the given user.
   *
   * @param {Request} req
   * @returns {Promise<Clock>}
   */
  async getClock (req) {
    const userId = req.getInteger('userId');

    const user = await this.backend.ask('core:security:user:get', userId);

    if (!user) {
      error.throwError('security:user:with_id_not_found', userId);
    }

    const clock = await this.backend.ask('core:clock:get', userId);

    if (!clock) {
      error.throwError('api:clock:not_found', userId);
    }

    return {
      status: clock.status,
      start: clock.start,
    };
  }

  /**
   * Delete the clock of the current user.
   *
   * @param {Request} req
   * @returns {Promise<boolean>}
   */
  async deleteMyClock (req) {
    if (req.isAnonymous()) {
      error.throwError('security:user:not_authenticated');
    }

    await this.backend.ask('core:clock:delete', req.getUser().id);

    return true;
  }

  /**
   * Delete the clock of the given user.
   *
   * @param {Request} req
   * @returns {Promise<boolean>}
   */
  async delete (req) {
    const userId = req.getInteger('userId');

    const user = await this.backend.ask('core:security:user:get', userId);

    if (!user) {
      error.throwError('security:user:with_id_not_found', userId);
    }

    await this.backend.ask('core:clock:delete', userId);

    return true;
  }

}

module.exports = ClockController;