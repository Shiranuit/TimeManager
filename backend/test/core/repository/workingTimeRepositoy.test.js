'use strict';

const should = require('should');
const sinon = require('sinon');
const WorkingTimeRepository = require('../../../lib/core/repository/workingTimeRepository');
const BackendMock = require('../../mocks/backend.mock');

describe('WorkingTimeRepository', () => {
  let backend;
  let workingTimeRepository;
  
  describe('#init', () => {
    it('should setup onAsk methods', async() => {
      backend = new BackendMock({
        auth: {
          jwt: {
            secret: 'secret'
          }
        }
      });
      workingTimeRepository = new WorkingTimeRepository();
      
      await workingTimeRepository.init(backend);

      await should(backend.onAsk).be.calledWith('core:workingtime:list');
      await should(backend.onAsk).be.calledWith('core:workingtime:create');
      await should(backend.onAsk).be.calledWith('core:workingtime:update');
      await should(backend.onAsk).be.calledWith('core:workingtime:get');
      await should(backend.onAsk).be.calledWith('core:workingtime:delete');
    });
  });
});