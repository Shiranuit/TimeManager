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

  async createOrUpdateMyClock (req) {
    if (req.isAnonymous()) {
      error.throwError('security:user:not_authenticated');
    }

    let clock = await this.backend.ask('core:clock:get', req.getUser().id);

    if (!clock) {
      clock = await this.backend.ask('core:clock:create', req.getUser().id);
    } else {
      clock = await this.backend.ask('core:clock:update', req.getUser().id, !clock.status);
    }

    return {
      id: clock.id,
      status: clock.status,
      start: clock.start,
    };
  }

  async createOrUpdate (req) {
    const userId = req.getInteger('userId');

    const user = await this.backend.ask('core:security:user:get', userId);

    if (!user) {
      error.throwError('security:user:with_id_not_found', userId);
    }

    let clock = await this.backend.ask('core:clock:get', userId);

    if (!clock) {
      clock = await this.backend.ask('core:clock:create', userId);
    } else {
      clock = await this.backend.ask('core:clock:update', userId, !clock.status);
    }

    return {
      id: clock.id,
      status: clock.status,
      start: clock.start,
    };
  }

  async getMyClock (req) {
    if (req.isAnonymous()) {
      error.throwError('security:user:not_authenticated');
    }

    const clock = await this.backend.ask('core:clock:get', req.getUser().id);

    return {
      id: clock.id,
      status: clock.status,
      start: clock.start,
    };
  }

  async getClock (req) {
    const userId = req.getInteger('userId');

    const user = await this.backend.ask('core:security:user:get', userId);

    if (!user) {
      error.throwError('security:user:with_id_not_found', userId);
    }

    const clock = await this.backend.ask('core:clock:get', userId);

    if (!clock) {
      return null;
    }

    return {
      id: clock.id,
      status: clock.status,
      start: clock.start,
    };
  }

  async deleteMyClock (req) {
    if (req.isAnonymous()) {
      error.throwError('security:user:not_authenticated');
    }

    await this.backend.ask('core:clock:delete', req.getUser().id);

    return true;
  }

  async delete (req) {
    const userId = req.getInteger('userId');
    
    const user = await this.backend.ask('core:security:user:get', userId);

    if (!user) {
      error.throwError('security:user:with_id_not_found', userId);
    }

    await this.backend.ask('core:clock:delete', userId);

    return true;
  }


};

module.exports = ClockController;