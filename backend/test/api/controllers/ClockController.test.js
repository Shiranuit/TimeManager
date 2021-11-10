const should = require('should');
const sinon = require('sinon');
const { ClockController } = require('../../../lib/api/controllers');
const BackendMock = require('../../mocks/backend.mock');
const Request = require('../../../lib/api/requests/request');
const SecurityError = require('../../../lib/errors/securityError');
const BadRequestError = require('../../../lib/errors/badRequestError');

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

    it('should create a clock is no clock exists for the current user', async () => {
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
  });

});