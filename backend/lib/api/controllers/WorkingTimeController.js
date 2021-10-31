const BaseController = require('./BaseController');
const error = require('../../errors');

class WorkingTimeController extends BaseController {
  constructor () {
    super([
      { verb: 'get', url: '/:userId/_list', action: 'listWorkingTimes' },
      { verb: 'get', url: '/_me/_list', action: 'listMyWorkingTimes' },

      { verb: 'get', url: '/:userId/:workId', action: 'getWorkingTime' },
      { verb: 'get', url: '/_me/:workId', action: 'getMyWorkingTime' },

      { verb: 'post', url: '/:userId', action: 'createWorkingTime' },
      { verb: 'post', url: '/_me', action: 'createMyWorkingTime' },

      { verb: 'put', url: '/:userId/:workId', action: 'updateWorkingTime' },
      { verb: 'put', url: '/_me/:workId', action: 'updateMyWorkingTime' },
      
      { verb: 'delete', url: '/:userId/:workId', action: 'deleteWorkingTime' },
      { verb: 'delete', url: '/_me/:workId', action: 'deleteMyWorkingTime' },
    ]);
  }

  async listWorkingTimes (req) {
    const userId = req.getInteger('userId');

    const user = await this.backend.ask('core:security:user:get', userId);

    if (!user) {
      error.throwError('security:user:with_id_not_found', userId);
    }

    return await this.backend.ask('core:workingtime:list', userId);
  }

  async listMyWorkingTimes (req) {
    if (req.isAnonymous()) {
      error.throwError('security:user:not_authenticated');
    }

    return await this.backend.ask('core:workingtime:list', req.getUser().id);
  }

  async getWorkingTime (req) {
    const userId = req.getInteger('userId');
    const workId = req.getInteger('workId');

    const user = await this.backend.ask('core:security:user:get', userId);

    if (!user) {
      error.throwError('security:user:with_id_not_found', userId);
    }

    const workingTime = await this.backend.ask('core:workingtime:get', userId, workId);

    if (!workingTime) {
      error.throwError('api:workingtime:not_found', workId, req.getUser().id);
    }

    return {
      id: workingTime.id,
      start: workingTime._start,
      end: workingTime._end,
      description: workingTime._description,
    };
  }

  async getMyWorkingTime (req) {
    const workId = req.getInteger('workId');

    if (req.isAnonymous()) {
      error.throwError('security:user:not_authenticated');
    }

    const workingTime = await this.backend.ask('core:workingtime:get', req.getUser().id, workId);

    if (!workingTime) {
      error.throwError('api:workingtime:not_found', workId, req.getUser().id);
    }

    return {
      id: workingTime.id,
      start: workingTime._start,
      end: workingTime._end,
      description: workingTime._description,
    };
  }

  async createWorkingTime (req) {
    const userId = req.getInteger('userId');

    const start = req.getBodyInteger('start');
    const end = req.getBodyInteger('end');
    const description = req.getBodyString('description', '');

    const user = await this.backend.ask('core:security:user:get', userId);

    if (!user) {
      error.throwError('security:user:with_id_not_found', userId);
    }

    const workingTime = await this.backend.ask(
      'core:workingtime:create',
      userId,
      { _start: start, _end: end, _description: description }
    );

    if (!workingTime) {
      error.throwError('api:workingtime:creation_failed');
    }

    return {
      id: workingTime.id,
      start: workingTime._start,
      end: workingTime._end,
      description: workingTime._description,
    };
  }

  async createMyWorkingTime (req) {
    const start = req.getBodyInteger('start');
    const end = req.getBodyInteger('end');
    const description = req.getBodyString('description', '');

    if (req.isAnonymous()) {
      error.throwError('security:user:not_authenticated');
    }

    const workingTime = await this.backend.ask(
      'core:workingtime:create',
      req.getUser().id,
      { _start: start, _end: end, _description: description }
    );

    if (!workingTime) {
      error.throwError('api:workingtime:creation_failed');
    }

    return {
      id: workingTime.id,
      start: workingTime._start,
      end: workingTime._end,
      description: workingTime._description,
    };
  }

  async updateWorkingTime (req) {
    const userId = req.getInteger('userId');
    const workId = req.getInteger('workId');

    const user = await this.backend.ask('core:security:user:get', userId);

    if (!user) {
      error.throwError('security:user:with_id_not_found', userId);
    }

    const body = req.getBody();
    const sanitizedBody = {
      _start: body.start,
      _end: body.end,
      _description: body.description,
    };

    const workingTime = await this.backend.ask('core:workingtime:update', userId, workId, sanitizedBody);

    if (!workingTime) {
      error.throwError('api:workingtime:update_failed');
    }

    return {
      id: workingTime.id,
      start: workingTime._start,
      end: workingTime._end,
      description: workingTime._description,
    };
  }

  async updateMyWorkingTime (req) {
    const workId = req.getInteger('workId');

    if (req.isAnonymous()) {
      error.throwError('security:user:not_authenticated');
    }

    const body = req.getBody();
    const sanitizedBody = {
      _start: body.start,
      _end: body.end,
      _description: body.description,
    };

    const workingTime = await this.backend.ask('core:workingtime:update', req.getUser().id, workId, sanitizedBody);

    if (!workingTime) {
      error.throwError('api:workingtime:update_failed');
    }

    return {
      id: workingTime.id,
      start: workingTime._start,
      end: workingTime._end,
      description: workingTime._description,
    };
  }

  async deleteWorkingTime (req) {
    const userId = req.getInteger('userId');
    const workId = req.getInteger('workId');

    const user = await this.backend.ask('core:security:user:get', userId);

    if (!user) {
      error.throwError('security:user:with_id_not_found', userId);
    }

    await this.backend.ask('core:workingtime:delete', userId, workId);

    return true;
  }

  async deleteMyWorkingTime (req) {
    const workId = req.getInteger('workId');

    if (req.isAnonymous()) {
      error.throwError('security:user:not_authenticated');
    }

    await this.backend.ask('core:workingtime:delete', req.getUser().id, workId);

    return true;
  }


};

module.exports = WorkingTimeController;