'use strict';

class ClockRepository {
  constructor () {
    this.backend = null;
  }

  async init (backend) {
    this.backend = backend;

    backend.onAsk('core:clock:create', this.createClock.bind(this));
    backend.onAsk('core:clock:update', this.updateClock.bind(this));
    backend.onAsk('core:clock:get', this.getClock.bind(this));
    backend.onAsk('core:clock:delete', this.deleteClock.bind(this));
  }

  async getClock (userId) {
    const result = await this.backend.ask(
      'postgres:query',
      'SELECT id, status, start_date FROM clocks WHERE user_id = $1;',
      [userId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return {
      id: result.rows[0].id,
      status: result.rows[0].status,
      start: result.rows[0].start_date,
    };
  }

  async createClock (userId) {
    const result = await this.backend.ask(
      'postgres:query',
      'INSERT INTO clocks (user_id) VALUES ($1) RETURNING status, start_date;',
      [userId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return {
      id: result.rows[0].id,
      status: result.rows[0].status,
      start: result.rows[0].start_date,
    };
  }

  async updateClock (userId, data) {
    const result = await this.backend.ask(
      'postgres:query',
      'UPDATE clocks SET status = $2, start_date = $3 WHERE user_id = $1 RETURNING status, start_date;',
      [userId, data.status, data.start]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return {
      id: result.rows[0].id,
      status: result.rows[0].status,
      start: result.rows[0].start_date,
    };
  }

  async deleteClock (userId) {
    await this.backend.ask(
      'postgres:query',
      'DELETE FROM clocks WHERE user_id = $1;',
      [userId]
    );
  }
}

module.exports = ClockRepository;