const { Client } = require('pg');


class Postgres {
  constructor() {
    this.backend = null;
    this.client = null;
  }

  async init(backend) {
    this.backend = backend;
    try {
      this.backend.logger.info('Trying to connect to Postgres');
      this.client = new Client(backend.config.postgres);
      await this.client.connect();
      this.backend.logger.info('Connected to Postgres');
    } catch (err) {
      this.backend.logger.error('Connection to Postgres failed');
      throw err;
    }

    this.backend.onAsk('postgres:query', this.query.bind(this));
  }

  async query(query, params) {
    return this.client.query(query, params);
  }
}

module.exports = Postgres;