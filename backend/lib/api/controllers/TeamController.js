const BaseController = require('./BaseController');
const error = require('../../errors');

class TeamController extends BaseController {
  constructor() {
    super([
      { verb: 'post', path: '/', action: 'createTeam' },
      { verb: 'get', path: '/_list', action: 'listTeams' },
      { verb: 'get', path: '/:userId/_list', action: 'listUserTeams' },
      { verb: 'get', path: '/:teamName', action: 'getTeamByName' },
      { verb: 'delete', path: '/:teamName', action: 'deleteTeam' },
      { verb: 'put', path: '/:teamName/:userId', action: 'addTeamUser' },
      { verb: 'delete', path: '/:teamName/:userId', action: 'removeTeamUser' },

      { verb: 'post', path: '/_me', action: 'createOwnedTeam' },
      { verb: 'delete', path: '/_me/:teamName', action: 'deleteOwnedTeam' },
      { verb: 'get', path: '/_me/_list', action: 'listOwnedTeams' },
      { verb: 'get', path: '/_me/:teamName', action: 'getOwnedTeamByName' },
      { verb: 'put', path: '/_me/:teamName/:userId', action: 'addOwnedTeamUser' },
      { verb: 'delete', path: '/_me/:teamName/:userId', action: 'removeOwnedTeamUser' },
    ]);
  }

  /**
   * Create a new team
   *
   * @param {Request} req
   */
  async createTeam(req) {
    if (req.isAnonymous()) {
      error.throwError('security:user:not_authenticated');
    }

    const name = req.getBodyString('name');
    const ownerId = req.getBodyInteger('owner_id', 0) || null;

    try {
      const team = await this.backend.ask('core:team:create', name, ownerId);

      if (!team) {
        error.throwError('api:team:creation_failed', name);
      }

      return {
        name: team.name,
        owner: team.owner_id
      };
    } catch (err) {
      if (err.code) {
        if (err.code === '23505') {
          if (err.constraint === 'unique_team_name') {
            error.throwError('api:team:already_exists', name);
          }
        }
      }
      throw err;
    }
  }

  async listTeams() {
    return await this.backend.ask('core:team:list');
  }

  async deleteTeam(req) {
    const teamname = req.getString('teamName');

    return await this.backend.ask('core:team:delete', teamname);
  }

  async addTeamUser(req) {
    const teamname = req.getString('teamName');
    const userId = req.getInteger('userId');

    try {
      const team = await this.backend.ask('core:team:addUserToTeam', teamname, userId);

      if (!team) {
        error.throwError('api:team:user_add_failed', userId, teamname);
      }

      return {
        name: team.name,
        owner_id: team.owner_id,
        members_id: team.members_id
      };
    } catch (err) {
      if (err.code) {
        if (err.code === '23503') {
          if (err.constraint === 'fk_user') {
            error.throwError('security:user:with_id_not_found', userId);
          }
        }
      }
      throw err;
    }
  }

  async removeTeamUser(req) {
    const teamname = req.getString('teamName');
    const userId = req.getInteger('userId');

    const team = await this.backend.ask('core:team:removeUserFromTeam', teamname, userId);

    if (!team) {
      error.throwError('api:team:user_remove_failed', userId, teamname);
    }

    return {
      name: team.name,
      owner_id: team.owner_id,
      members_id: team.members_id
    };
  }

  async getTeamByName(req) {
    const teamname = req.getString('teamName');

    const team = await this.backend.ask('core:team:get', teamname);

    if (!team) {
      error.throwError('api:team:not_found', teamname);
    }

    return {
      name: team.name,
      owner_id: team.owner_id,
      members_id: team.members_id
    };
  }

  async listUserTeams(req) {
    const userId = req.getInteger('userId');

    return await this.backend.ask('core:team:list:byUser', userId);
  }

  async listOwnedTeams(req) {
    if (req.isAnonymous()) {
      error.throwError('security:user:not_authenticated');
    }

    return await this.backend.ask('core:team:list:byUser', req.getUser().id);
  }

  /**
   * Create a new team for owned by the requesting user
   *
   * @param {Request} req
   */
   async createOwnedTeam(req) {
    if (req.isAnonymous()) {
      error.throwError('security:user:not_authenticated');
    }

    const name = req.getBodyString('name');

    try {
      const team = await this.backend.ask('core:team:create', name, req.getUser().id);

      if (!team) {
        error.throwError('api:team:creation_failed', name);
      }

      return {
        name: team.name,
        owner: team.owner_id
      };
    } catch (err) {
      if (err.code) {
        if (err.code === '23505') {
          if (err.constraint === 'unique_team_name') {
            error.throwError('api:team:already_exists', name);
          }
        }
      }
      throw err;
    }
  }

  async deleteOwnedTeam(req) {
    const teamname = req.getString('teamName');

    const owned = await this.backend.ask('core:team:verify', teamname, req.getUser().id);

    if (!owned) {
      error.throwError('api:team:team_not_owned', teamname);
    }

    return await this.backend.ask('core:team:delete', teamname);
  }

  async addOwnedTeamUser(req) {
    const teamname = req.getString('teamName');
    const userId = req.getInteger('userId');

    const owned = await this.backend.ask('core:team:verify', teamname, req.getUser().id);

    if (!owned) {
      error.throwError('api:team:team_not_owned', teamname);
    }

    try {
      const team = await this.backend.ask('core:team:addUserToTeam', teamname, userId);

      if (!team) {
        error.throwError('api:team:user_add_failed', userId, teamname);
      }

      return {
        name: team.name,
        owner_id: team.owner_id,
        members_id: team.members_id
      };
    } catch (err) {
      if (err.code) {
        if (err.code === '23503') {
          if (err.constraint === 'fk_user') {
            error.throwError('security:user:with_id_not_found', userId);
          }
        }
      }
      console.log(err);
      throw err;
    }
  }

  async removeOwnedTeamUser(req) {
    const teamname = req.getString('teamName');
    const userId = req.getInteger('userId');

    const owned = await this.backend.ask('core:team:verify', teamname, req.getUser().id);

    if (!owned) {
      error.throwError('api:team:team_not_owned', teamname);
    }

    const team = await this.backend.ask('core:team:removeUserFromTeam', teamname, userId);

    if (!team) {
      error.throwError('api:team:user_remove_failed', userId, teamname);
    }

    return {
      name: team.name,
      owner_id: team.owner_id,
      members_id: team.members_id
    };
  }

  async getOwnedTeamByName(req) {
    const teamname = req.getString('teamName');

    const owned = await this.backend.ask('core:team:verify', teamname, req.getUser().id);

    if (!owned) {
      error.throwError('api:team:team_not_owned', teamname);
    }

    const team = await this.backend.ask('core:team:get', teamname);

    if (!team) {
      error.throwError('api:team:not_found', teamname);
    }

    return {
      name: team.name,
      owner_id: team.owner_id,
      members_id: team.members_id
    };
  }
}

module.exports = TeamController;