'use strict';

const UserRepository = require('./userRepository');
const TokenRepository = require('./tokenRepository');
const Vault = require('./vault');

class SecurityModule {
  constructor () {
    this.backend = null;
    this.user = new UserRepository(this);
    this.token = new TokenRepository(this);
    this.vault = new Vault(this);
  }

  async init (backend) {
    this.backend = backend;
    await this.vault.init(backend);
    await this.user.init(backend);
    await this.token.init(backend);
  }
}

module.exports = SecurityModule;