'use strict';

const should = require('should');
const sinon = require('sinon');
const TeamRepository = require('../../../lib/core/repository/teamRepository');
const BackendMock = require('../../mocks/backend.mock');

describe('TeamRepository', () => {
  let backend;
  let teamRepository;
  
  describe('#init', () => {
    it('should setup onAsk methods', async() => {
      backend = new BackendMock({
        auth: {
          jwt: {
            secret: 'secret'
          }
        }
      });
      teamRepository = new TeamRepository();
      
      await teamRepository.init(backend);

      await should(backend.onAsk).be.calledWith('core:team:create');
      await should(backend.onAsk).be.calledWith('core:team:list');
      await should(backend.onAsk).be.calledWith('core:team:list:byUser');
      await should(backend.onAsk).be.calledWith('core:team:get');
      await should(backend.onAsk).be.calledWith('core:team:delete');
      await should(backend.onAsk).be.calledWith('core:team:removeUserFromTeam');
      await should(backend.onAsk).be.calledWith('core:team:addUserToTeam');
      await should(backend.onAsk).be.calledWith('core:team:verify');
    });
  });
});