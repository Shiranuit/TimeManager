'use strict';

const should = require('should');
const sinon = require('sinon');
const ClockRepository = require('../../../lib/core/repository/clockRepository');
const BackendMock = require('../../mocks/backend.mock');

describe('ClockRepository', () => {
  let backend;
  let clockRepository;
  
  describe('#init', () => {
    it('should setup onAsk methods', async() => {
      backend = new BackendMock({
        auth: {
          jwt: {
            secret: 'secret'
          }
        }
      });
      clockRepository = new ClockRepository();
      
      await clockRepository.init(backend);

      await should(backend.onAsk).be.calledWith('core:clock:create');
      await should(backend.onAsk).be.calledWith('core:clock:update');
      await should(backend.onAsk).be.calledWith('core:clock:get');
      await should(backend.onAsk).be.calledWith('core:clock:delete');
    });
  });
});