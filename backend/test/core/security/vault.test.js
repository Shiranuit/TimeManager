'use strict';

const should = require('should');
const sinon = require('sinon');
const { vault } = require('../../../config');
const Vault = require('../../../lib/core/security/vault');
const BackendMock = require('../../mocks/backend.mock');

describe('Vault', () => {
  let backend;
  let vault;
  beforeEach(() => {
    backend = new BackendMock();
    vault = new Vault(backend);
  });

  describe('#init', () => {
    it('should reject if cannot connect to the database', async() => {
      backend = new BackendMock({});
      vault = new Vault(backend);
      
      await vault.init(backend);

      await should(backend.onAsk).be.calledWith('core:security:vault:hash');
      await should(backend.onAsk).be.calledWith('core:security:vault:verify');
    });
  });
});