'use strict';

const User = require('../../model/user');

class UserRepository {
  constructor () {
    this.backend = null;
  }

  async init (backend) {
    this.backend = backend;

    backend.onAsk('core:security:user:create', this.registerUser.bind(this));
    backend.onAsk('core:security:user:verify', this.verify.bind(this));
    backend.onAsk('core:security:user:get', this.getUser.bind(this));
    backend.onAsk('core:security:user:update', this.updateUser.bind(this));
    backend.onAsk('core:security:user:list', this.listUsers.bind(this));
    backend.onAsk('core:security:user:delete', this.deleteUser.bind(this));
  }

  async registerUser (data) {
    const hashedPassword = await this.backend.ask('core:security:vault:hash', data.password);
    
    const result = await this.backend.ask(
      'postgres:query',
      'INSERT INTO users (email, username, password) VALUES ($1, $2, $3) RETURNING id;',
      [data.email, data.username, hashedPassword]
    );
    
    return new User(result.rows[0].id);
  }

  async verify (data) {
    const hashedPassword = await this.backend.ask('core:security:vault:hash', data.password);

    const result = await this.backend.ask(
      'postgres:query',
      'SELECT id FROM users WHERE username = $1 AND password = $2;',
      [data.username, hashedPassword]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return new User(result.rows[0].id);
  }

  async getUser (id) {
    const result = await this.backend.ask(
      'postgres:query',
      'SELECT id, username, email FROM users WHERE id = $1;',
      [id]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return {
      username: result.rows[0].username,
      email: result.rows[0].email,
      id
    };
  }

  async updateUser (id, data) {
    const result = await this.backend.ask(
      'postgres:query',
      'UPDATE users SET username = $2, email = $3 WHERE id = $1 RETURNING id, username, email;',
      [id, data.username, data.email]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return {
      username: result.rows[0].username,
      email: result.rows[0].email,
      id: result.rows[0].id
    };
  }

  async listUsers () {
    const result = await this.backend.ask(
      'postgres:query',
      'SELECT id, email, username FROM users;',
    );

    return result.rows || [];
  }

  async deleteUser (id) {
    await this.backend.ask(
      'postgres:query',
      'DELETE FROM users WHERE id = $1;',
      [id]
    );
  }
}

module.exports = UserRepository;