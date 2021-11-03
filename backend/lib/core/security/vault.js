'use strict';

const crypto = require('crypto');

class Vault {
  constructor () {
    this.backend = null;
    this.config = null;
  }

  /**
   * Initialize the Vault module
   * @param {Backend} backend 
   */
  async init (backend) {
    this.backend = backend;
    this.config = this.backend.config.vault;

    /**
     * Register all the askable methods
     */
    backend.onAsk('core:security:vault:hash', this.hash.bind(this));
  }

  async hash (str) {
    const hash = crypto.createHash(this.config.algorithm);
    hash.update(str);
    return hash.digest('hex');
  }
}

module.exports = Vault;