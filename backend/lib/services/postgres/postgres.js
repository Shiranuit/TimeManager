'use strict';

const { Client } = require('pg');
const Prom = require('../../utils/prom');
const ms = require('ms');

class Postgres {
  constructor () {
    this.backend = null;
    this.config = null;
    this.client = null;
  }

  async init (backend) {
    this.backend = backend;
    this.config = backend.config.postgres;
    this.backend.logger.info('Trying to connect to Postgres');
    let retries = 0;
    const retryDelay = ms(this.config.retryDelay);
    while (retries < this.config.maxRetries) {
      try {
        this.client = new Client(this.config);
        await this.client.connect();
        this.backend.logger.info('Connected to Postgres');
        break;
      } catch (err) {
        retries++;
        if (retries >= this.config.maxRetries) {
          this.backend.logger.error('Could not connect to Postgres in time');
          throw err;
        } else {
          this.backend.logger.info('Waiting for postgres...');
        }
      }
      await Prom.sleep(retryDelay);
    }

    this.backend.onAsk('postgres:query', this.query.bind(this));
  }

  async query (query, params) {
    return this.client.query(query, params);
  }
}

module.exports = Postgres;