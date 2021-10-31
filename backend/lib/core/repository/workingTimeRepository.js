class WorkingTimeRepository {
  constructor () {
    this.backend = null;
  }

  async init (backend) {
    this.backend = backend;

    backend.onAsk('core:workingtime:list', this.listWorkingTimes.bind(this));
    backend.onAsk('core:workingtime:create', this.createWorkingTime.bind(this));
    backend.onAsk('core:workingtime:update', this.updateWorkingTime.bind(this));
    backend.onAsk('core:workingtime:get', this.getWorkingTime.bind(this));
    backend.onAsk('core:workingtime:delete', this.deleteWorkingTime.bind(this));
  }

  async listWorkingTimes (userId) {
    const result = await this.backend.ask(
      'postgres:query',
      'SELECT id, _start, _end, _description FROM workingtimes WHERE user_id = $1;',
      [userId]
    );

    return result.rows || [];
  }

  async createWorkingTime (userId, data) {
    const result = await this.backend.ask(
      'postgres:query',
      'INSERT INTO workingtimes (user_id, _start, _end, _description) VALUES ($1, $2, $3, $4) RETURNING _start, _end, _description, id;',
      [userId, data._start, data._end, data._description]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0];
  }

  async updateWorkingTime (userId, workId, data) {
    const result = await this.backend.ask(
      'postgres:query',
      'UPDATE workingtimes SET _start = $3, _end = $4, _description = $5 WHERE user_id = $1 and id = $2 RETURNING _start, _end, _description, id;',
      [userId, workId, data._start, data._end, data._description]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0];
  }

  async getWorkingTime (userId, workId) {
    const result = await this.backend.ask(
      'postgres:query',
      'SELECT id, _start, _end, _description FROM workingtimes WHERE user_id = $1 and id = $2',
      [userId, workId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0];
  }

  async deleteWorkingTime (userId, workId) {
    await this.backend.ask(
      'postgres:query',
      'DELETE FROM workingtimes WHERE user_id = $1 and id = $2;',
      [userId, workId]
    );
  }
}

module.exports = WorkingTimeRepository;