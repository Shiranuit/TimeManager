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
    let resolve;
    let reject;
    const promise = new Promise((_res, _rej) => {
      resolve = _res;
      reject = _rej;
    });

    const hash = crypto.createHash(this.config.algorithm);
    hash.update(str);
    const digest = hash.digest('hex');

    crypto.pbkdf2(
      digest,
      this.config.salt,
      this.config.derivationRound,
      digest.length,
      this.config.algorithm,
      (err, key) => {
        if (err) {
          reject(err);
          return;
        }

        resolve(key.toString('hex'));
      });

    return promise;
  }
}

module.exports = Vault;