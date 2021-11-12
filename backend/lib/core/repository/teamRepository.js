'use strict';

class TeamRepository {
  constructor () {
    this.backend = null;
  }

  /**
   * Initialize the repository
   * @param {Backend} backend
   */
  async init (backend) {
    this.backend = backend;

    /**
     * Register all the askable methods
     */
    backend.onAsk('core:team:create', this.createTeam.bind(this));
    backend.onAsk('core:team:list', this.listTeam.bind(this));
    backend.onAsk('core:team:list:byUser', this.listTeamByUser.bind(this));
    backend.onAsk('core:team:get', this.getTeam.bind(this));
    backend.onAsk('core:team:delete', this.deleteTeam.bind(this));
    backend.onAsk('core:team:removeUserFromTeam', this.removeUserFromTeam.bind(this));
    backend.onAsk('core:team:addUserToTeam', this.addUserToTeam.bind(this));
    backend.onAsk('core:team:verify', this.verifyTeamOwner.bind(this));
    backend.onAsk('core:team:verify:member', this.verifyTeamMember.bind(this));
  }

  async createTeam(name, owner_id) {
    await this.backend.ask(
      'postgres:query',
      'INSERT INTO teams (name, owner_id) VALUES ($1, $2)',
      [name, owner_id]
    );

    return {
      name,
      owner_id,
    };
  }

  async listTeam() {
    const result = await this.backend.ask(
      'postgres:query',
      'SELECT name, owner_id FROM teams;'
    );

    return result.rows || [];
  }

  async listTeamByUser(user_id) {
    const teamsResult = await this.backend.ask(
      'postgres:query',
      'SELECT public.list_user_teams($1);',
      [user_id]
    );

    if (teamsResult.rows.length === 0) {
      return [];
    }

    const teams = [];
    for (const teamname of (teamsResult.rows[0].list_user_teams || [])) {
      teams.push(await this.getTeam(teamname));
    }

    return teams;
  }

  async deleteTeam(name) {
    await this.backend.ask(
      'postgres:query',
      'DELETE FROM teams WHERE name = $1;',
      [name]
    );

    return true;
  }

  async addUserToTeam(name, userId) {

    const result = await this.backend.ask(
      'postgres:query',
      'SELECT name, user_id FROM teams_members WHERE name = $1 AND user_id = $2;',
      [name, userId]
    );

    if (result.rows.length > 0) {
      return await this.getTeam(name);
    }

    await this.backend.ask(
      'postgres:query',
      'INSERT INTO teams_members (name, user_id) VALUES ($1, $2);',
      [name, userId]
    );

    return await this.getTeam(name);
  }

  async removeUserFromTeam(name, userId) {
    await this.backend.ask(
      'postgres:query',
      'DELETE FROM teams_members WHERE name = $1 AND user_id = $2;',
      [name, userId]
    );

    return await this.getTeam(name);
  }

  async getTeam(name) {
    const teamOwner = await this.backend.ask(
      'postgres:query',
      'SELECT name, owner_id FROM teams WHERE name = $1;',
      [name]
    );

    if (teamOwner.rows.length === 0) {
      return null;
    }

    const teamMembers = await this.backend.ask(
      'postgres:query',
      'SELECT name, array_agg(user_id) as members FROM teams_members WHERE name = $1 GROUP BY name;',
      [name]
    );

    return {
      name: teamOwner.rows[0].name,
      owner_id: teamOwner.rows[0].owner_id,
      members_id: teamMembers.rows.length > 0 ? teamMembers.rows[0].members : [],
    };
  }

  async verifyTeamOwner(name, ownerId) {
    const result = await this.backend.ask(
      'postgres:query',
      'SELECT name, owner_id FROM teams WHERE name = $1 AND owner_id = $2;',
      [name, ownerId]
    );

    return result.rows.length > 0;
  }

  async verifyTeamMember(name, user_id) {
    const result = await this.backend.ask(
      'postgres:query',
      'SELECT name, user_id FROM teams_members WHERE name = $1 AND user_id = $2;',
      [name, user_id]
    );

    return result.rows.length > 0;
  }
}

module.exports = TeamRepository;