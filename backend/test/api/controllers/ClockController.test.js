const should = require('should');
const sinon = require('sinon');
const { ClockController } = require('../../../lib/api/controllers');
const BackendMock = require('../../mocks/backend.mock');
const Request = require('../../../lib/api/requests/request');
const SecurityError = require('../../../lib/errors/securityError');
const BadRequestError = require('../../../lib/errors/badRequestError');
const ApiError = require('../../../lib/errors/apiError');

describe('ClockController', () => {
  let clockController;
  let backend;
  beforeEach(async () => {
    clockController = new ClockController();
    backend = new BackendMock({});
    await clockController.init(backend);
  });

  describe('#createOrUpdateMyClock', () => {
    let request;
    beforeEach(() => {
      request = new Request({
        url: '',
        headers: {},
        host: '',
      });
    });

    it('should reject if the user is not authenticated', async () => {
      request.context.user = { id: null };
      await should(clockController.createOrUpdateMyClock(request)).be.rejectedWith(
        SecurityError,
        { id: 'security:user:not_authenticated' }
      );
    });

    it('should create a clock if no clock exists for the current user', async () => {
      request.context.user = { id: 42 };
      backend.ask.withArgs('core:clock:get').resolves(null);
      backend.ask.withArgs('core:clock:create')
        .resolves({
          id: 1,
          status: true,
          start: 666
        });

      const response = await clockController.createOrUpdateMyClock(request);

      await should(backend.ask).be.calledWith('core:clock:get', 42);
      await should(backend.ask).be.calledWith('core:clock:create', 42);
      await should(response)
        .be.Object()
        .and.match({
          status: true,
          start: 666
        });
    });

    it('should update the clock if a clock exists for the current user', async () => {
      request.context.user = { id: 42 };
      backend.ask.withArgs('core:clock:get').resolves({status: true, start: new Date(666)});
      backend.ask.withArgs('core:clock:update')
        .resolves({
          id: 1,
          status: false,
          start: new Date(666)
        });

      const response = await clockController.createOrUpdateMyClock(request);

      await should(backend.ask).be.calledWith('core:clock:get', 42);
      await should(backend.ask).be.calledWith('core:clock:update', 42, {start: new Date(666), status: false});
      await should(response)
        .be.Object()
        .and.match({
          status: false,
          start: new Date(666)
        });
    });

    it('should reject with api:clock:update_failed if the update failed', async () => {
      request.context.user = { id: 42 };
      backend.ask.withArgs('core:clock:get').resolves({status: true, start: new Date(666)});
      backend.ask.withArgs('core:clock:update')
        .resolves(null);

      await should(clockController.createOrUpdateMyClock(request))
        .be.rejectedWith(
          ApiError,
          { id: 'api:clock:update_failed' }
        );

      await should(backend.ask).be.calledWith('core:clock:get', 42);
      await should(backend.ask).be.calledWith('core:clock:update', 42, {start: new Date(666), status: false});
    });

    it('should reject with api:clock:creation_failed if the creation has failed', async () => {
      request.context.user = { id: 42 };
      backend.ask.withArgs('core:clock:get').resolves(null);
      backend.ask.withArgs('core:clock:create')
        .resolves(null);

      await should(clockController.createOrUpdateMyClock(request))
        .be.rejectedWith(
          ApiError,
          { id: 'api:clock:creation_failed' }
        );

      await should(backend.ask).be.calledWith('core:clock:get', 42);
      await should(backend.ask).be.calledWith('core:clock:create', 42);
    });

    it('should create a new working time when stopping a running clock', async () => {
      request.context.user = { id: 42 };
      backend.ask.withArgs('core:clock:get').resolves({status: true, start: new Date(666)});
      backend.ask.withArgs('core:clock:update')
        .resolves({
          id: 1,
          status: false,
          start: new Date(666)
        });

      const response = await clockController.createOrUpdateMyClock(request);

      await should(backend.ask).be.calledWith('core:clock:get', 42);
      await should(backend.ask).be.calledWith('core:clock:update', 42, {start: new Date(666), status: false});
      await should(backend.ask).be.calledWithMatch('core:workingtime:create', 42, {
        _start: new Date(666).toISOString(),
        _end: sinon.match.string,
        _description: ''
      });
      await should(response)
        .be.Object()
        .and.match({
          status: false,
          start: new Date(666)
        });
    });

    it('should reset the clock running time when starting a new clock', async () => {
      request.context.user = { id: 42 };
      backend.ask.withArgs('core:clock:get').resolves({status: false, start: new Date(666)});
      backend.ask.withArgs('core:clock:update')
        .resolves({
          id: 1,
          status: true,
          start: new Date(888)
        });

      const response = await clockController.createOrUpdateMyClock(request);

      await should(backend.ask).be.calledWith('core:clock:get', 42);
      await should(backend.ask).be.calledWithMatch('core:clock:update', 42, {start: sinon.match.string, status: true});
      await should(response)
        .be.Object()
        .and.match({
          status: true,
          start: new Date(888)
        });
    });
  });

  describe('#createOrUpdate', () => {
    let request;
    beforeEach(() => {
      request = new Request({
        url: '',
        headers: {},
        host: '',
      });
      request.input.args = {
        userId: 42,
      };
    });

    it('should create a clock if no clock exists for the current user', async () => {
      backend.ask.withArgs('core:security:user:get').resolves({id: 42});
      backend.ask.withArgs('core:clock:get').resolves(null);
      backend.ask.withArgs('core:clock:create')
        .resolves({
          id: 1,
          status: true,
          start: new Date(666)
        });

      const response = await clockController.createOrUpdate(request);

      await should(backend.ask).be.calledWith('core:clock:get', 42);
      await should(backend.ask).be.calledWith('core:clock:create', 42);
      await should(response)
        .be.Object()
        .and.match({
          status: true,
          start: new Date(666)
        });
    });

    it('should update the clock if a clock exists for the current user', async () => {
      backend.ask.withArgs('core:security:user:get').resolves({id: 42});
      backend.ask.withArgs('core:clock:get').resolves({status: true, start: new Date(666)});
      backend.ask.withArgs('core:clock:update')
        .resolves({
          id: 1,
          status: false,
          start: new Date(666)
        });

      const response = await clockController.createOrUpdate(request);

      await should(backend.ask).be.calledWith('core:clock:get', 42);
      await should(backend.ask).be.calledWith('core:clock:update', 42, {start: new Date(666), status: false});
      await should(response)
        .be.Object()
        .and.match({
          status: false,
          start: new Date(666)
        });
    });

    it('should reject with api:clock:update_failed if the update failed', async () => {
      backend.ask.withArgs('core:security:user:get').resolves({id: 42});
      backend.ask.withArgs('core:clock:get').resolves({status: true, start: new Date(666)});
      backend.ask.withArgs('core:clock:update')
        .resolves(null);

      await should(clockController.createOrUpdate(request))
        .be.rejectedWith(
          ApiError,
          { id: 'api:clock:update_failed' }
        );

      await should(backend.ask).be.calledWith('core:clock:get', 42);
      await should(backend.ask).be.calledWith('core:clock:update', 42, {start: new Date(666), status: false});
    });

    it('should reject with api:clock:creation_failed if the creation has failed', async () => {
      backend.ask.withArgs('core:security:user:get').resolves({id: 42});
      backend.ask.withArgs('core:clock:get').resolves(null);
      backend.ask.withArgs('core:clock:create')
        .resolves(null);

      await should(clockController.createOrUpdate(request))
        .be.rejectedWith(
          ApiError,
          { id: 'api:clock:creation_failed' }
        );

      await should(backend.ask).be.calledWith('core:clock:get', 42);
      await should(backend.ask).be.calledWith('core:clock:create', 42);
    });

    it('should reject with api:clock:update_failed if the update has failed', async () => {
      backend.ask.withArgs('core:security:user:get').resolves({id: 42});
      backend.ask.withArgs('core:clock:get').resolves({status: true, start: new Date(666)});
      backend.ask.withArgs('core:clock:update')
        .resolves(null);

      await should(clockController.createOrUpdate(request))
        .be.rejectedWith(
          ApiError,
          { id: 'api:clock:update_failed' }
        );

      await should(backend.ask).be.calledWith('core:clock:get', 42);
      await should(backend.ask).be.calledWith('core:clock:update', 42, {start: new Date(666), status: false});
    });

    it('should create a new working time when stopping a running clock', async () => {
      backend.ask.withArgs('core:security:user:get').resolves({id: 42});
      backend.ask.withArgs('core:clock:get').resolves({status: true, start: new Date(666)});
      backend.ask.withArgs('core:clock:update')
        .resolves({
          id: 1,
          status: false,
          start: new Date(666)
        });

      const response = await clockController.createOrUpdate(request);

      await should(backend.ask).be.calledWith('core:clock:get', 42);
      await should(backend.ask).be.calledWith('core:clock:update', 42, {start: new Date(666), status: false});
      await should(backend.ask).be.calledWithMatch('core:workingtime:create', 42, {
        _start: new Date(666).toISOString(),
        _end: sinon.match.string,
        _description: ''
      });
      await should(response)
        .be.Object()
        .and.match({
          status: false,
          start: new Date(666)
        });
    });

    it('should reset the clock running time when starting a new clock', async () => {
      backend.ask.withArgs('core:security:user:get').resolves({id: 42});
      backend.ask.withArgs('core:clock:get').resolves({status: false, start: new Date(666)});
      backend.ask.withArgs('core:clock:update')
        .resolves({
          id: 1,
          status: true,
          start: new Date(888)
        });

      const response = await clockController.createOrUpdate(request);

      await should(backend.ask).be.calledWith('core:clock:get', 42);
      await should(backend.ask).be.calledWithMatch('core:clock:update', 42, {start: sinon.match.string, status: true});
      await should(response)
        .be.Object()
        .and.match({
          status: true,
          start: new Date(888)
        });
    });
  });

  describe('#getMyClock', () => {
    let request;
    beforeEach(() => {
      request = new Request({
        url: '',
        headers: {},
        host: '',
      });
    });

    it('should reject if the user is not authenticated', async () => {
      request.context.user = { id: null };
      await should(clockController.getMyClock(request)).be.rejectedWith(
        SecurityError,
        { id: 'security:user:not_authenticated' }
      );
    });


    it('should reject if no clock found', async ()  => {
      request.context.user = { id: 42 };
      backend.ask.withArgs('core:clock:get').resolves(null);

      await should(clockController.getMyClock(request))
        .rejectedWith(
          ApiError,
          { id: 'api:clock:not_found' }
        );
      
      await should(backend.ask).be.calledWith('core:clock:get', 42);
    });

    it('should return the clock of the user if found', async ()  => {
      request.context.user = { id: 42 };
      backend.ask.withArgs('core:clock:get').resolves({ status: true, start: new Date(666) });

      const response = await clockController.getMyClock(request);

      await should(backend.ask).be.calledWith('core:clock:get', 42);
      await should(response)
        .be.an.Object()
        .and.match({
          status: true,
          start: new Date(666)
        });
    });
  });

  describe('#getClock', () => {
    let request;
    beforeEach(() => {
      request = new Request({
        url: '',
        headers: {},
        host: '',
      });
      request.input.args = {
        userId: 42
      };
    });

    it('should reject if the user does not exist', async () => {
      backend.ask.withArgs('core:security:user:get').resolves(null);

      await should(clockController.getClock(request))
        .rejectedWith(
          SecurityError,
          { id: 'security:user:with_id_not_found' }
        );
    });

    it('should reject if no clock found', async ()  => {
      backend.ask.withArgs('core:security:user:get').resolves({id: 42});
      backend.ask.withArgs('core:clock:get').resolves(null);

      await should(clockController.getClock(request))
        .rejectedWith(
          ApiError,
          { id: 'api:clock:not_found' }
        );
      
      await should(backend.ask).be.calledWith('core:clock:get', 42);
    });

    it('should return the clock of the user if found', async ()  => {
      backend.ask.withArgs('core:security:user:get').resolves({id: 42});
      backend.ask.withArgs('core:clock:get').resolves({ status: true, start: new Date(666) });

      const response = await clockController.getClock(request);

      await should(backend.ask).be.calledWith('core:clock:get', 42);
      await should(response)
        .be.an.Object()
        .and.match({
          status: true,
          start: new Date(666)
        });
    });
  });

  describe('#deleteMyClock', () => {
    let request;
    beforeEach(() => {
      request = new Request({
        url: '',
        headers: {},
        host: '',
      });
    });

    it('should reject if the user is not authenticated', async () => {
      request.context.user = { id: null };
      await should(clockController.deleteMyClock(request)).be.rejectedWith(
        SecurityError,
        { id: 'security:user:not_authenticated' }
      );
    });

    it('should ask core:clock:delete', async () => {
      request.context.user = { id: 42 };

      await clockController.deleteMyClock(request);

      should(backend.ask).be.calledWith('core:clock:delete', 42);
    });
  });

  describe('#delete', () => {
    let request;
    beforeEach(() => {
      request = new Request({
        url: '',
        headers: {},
        host: '',
      });
      request.input.args = {
        userId: 42
      };
    });

    it('should reject user does not exists', async () => {
      backend.ask.withArgs('core:security:user:get').resolves(null);

      await should(clockController.delete(request))
        .be.rejectedWith(
          SecurityError,
          { id: 'security:user:with_id_not_found' }
        );
    });

    it('should ask core:clock:delete', async () => {
      backend.ask.withArgs('core:security:user:get').resolves({id: 42});

      await clockController.delete(request);

      should(backend.ask).be.calledWith('core:clock:delete', 42);
    });
  });
});