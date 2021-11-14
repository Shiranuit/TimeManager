'use strict';

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
   * 
   * @openapi
   * @action createTeam
   * @description Create a new team
   * @bodyParam {string:"team_name"} name The name of the team
   * @bodyParam {number:null} owner_id The id of the owner of the team
   * @successField {string:"team_name"} name The name of the team
   * @successField {number:null} owner The id of the owner of the team
   * @error security:user:not_authenticated
   * @error api:team:name_too_short
   * @error api:team:creation_failed
   * @error api:team:already_exists
   * @error security:user:with_id_not_found
   */
  async createTeam(req) {
    if (req.isAnonymous()) {
      error.throwError('security:user:not_authenticated');
    }

    const name = req.getBodyString('name');
    const ownerId = req.getBodyInteger('owner_id', 0) || null;

    if (name.length < 3) {
      error.throwError('api:team:name_too_short');
    }

    try {
      const team = await this.backend.ask('core:team:create', name, ownerId);

      if (!team) {
        error.throwError('api:team:creation_failed', name);
      }

      return {
        name: team.name,
        owner_id: team.owner_id
      };
    } catch (err) {
      if (err.code) {
        if (err.code === '23505') {
          if (err.constraint === 'unique_team_name') {
            error.throwError('api:team:already_exists', name);
          }
        } else if (err.code === '23503') {
          if (err.constraint === 'fk_user') {
            error.throwError('security:user:with_id_not_found', ownerId);
          }
        }
      }
      throw err;
    }
  }

  /**
   * @openapi
   * @action listTeams
   * @description List all the teams
   * @return {array} [[{"name":"team_name","owner_id":1, "members_id":[1,2,3]}]]
   */
  async listTeams() {
    return await this.backend.ask('core:team:list');
  }

  /**
   * @openapi
   * @action deleteTeam
   * @templateParam {string} teamName The name of the team
   * @description Delete a team
   * @return {boolean} true
   */
  async deleteTeam(req) {
    const teamname = req.getString('teamName');

    return await this.backend.ask('core:team:delete', teamname);
  }

  /**
   * @openapi
   * @action addTeamUser
   * @description Add a user to a team
   * @templateParam {string} teamName The name of the team
   * @templateParam {number} userId The id of the user
   * @successField {string:"team_name"} name The name of the team
   * @successField {number:1} owner The id of the owner of the team
   * @successField {array:[1,2,3]} members_id The ids of the members of the team
   * @error api:team:user_add_failed
   * @error security:user:with_id_not_found
   */
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

  /**
   * @openapi
   * @action removeTeamUser
   * @description Remove a user from a team
   * @templateParam {string} teamName The name of the team
   * @templateParam {number} userId The id of the user
   * @successField {string:"team_name"} name The name of the team
   * @successField {number:1} owner The id of the owner of the team
   * @successField {array:[1,2,3]} members_id The ids of the members of the team
   * @error api:team:user_remove_failed
   */
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

  /**
   * @openapi
   * @action getTeamByName
   * @description Retrieve team informations by name
   * @templateParam {string} teamName The name of the team
   * @successField {string:"team_name"} name The name of the team
   * @successField {number:1} owner The id of the owner of the team
   * @successField {array:[1,2,3]} members_id The ids of the members of the team
   * @error api:team:not_found
   */
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

  /**
   * @openapi
   * @action listUserTeams
   * @description List all the teams a user is member of
   * @templateParam {number} userId The id of the user
   * @return {array} [[{"name":"team_name","owner_id":1, "members_id":[1,2,3]}]]
   */
  async listUserTeams(req) {
    const userId = req.getInteger('userId');

    return await this.backend.ask('core:team:list:byUser', userId);
  }

  /**
   * @openapi
   * @action listOwnedTeams
   * @description List all the teams owned by the current user
   * @return {array} [[{"name":"team_name","owner_id":1, "members_id":[1,2,3]}]]
   * @error security:user:not_authenticated
   */
  async listOwnedTeams(req) {
    if (req.isAnonymous()) {
      error.throwError('security:user:not_authenticated');
    }

    return await this.backend.ask('core:team:list:byUser', req.getUser().id);
  }

  /**
   * Create a new team owned by the current user
   * 
   * @openapi
   * @action createOwnedTeam
   * @description Create a new team owned by the current user
   * @templateParam {string} name The name of the team
   * @successField {string:"team_name"} name The name of the team
   * @successField {number:1} owner The id of the owner of the team
   * @error security:user:not_authenticated
   * @error api:team:name_too_short
   * @error api:team:creation_failed
   * @error api:team:already_exists
   * @error security:user:with_id_not_found
   */
  async createOwnedTeam(req) {
    if (req.isAnonymous()) {
      error.throwError('security:user:not_authenticated');
    }

    const name = req.getBodyString('name');

    if (name.length < 3) {
      error.throwError('api:team:name_too_short');
    }

    try {
      const team = await this.backend.ask('core:team:create', name, req.getUser().id);

      if (!team) {
        error.throwError('api:team:creation_failed', name);
      }

      return {
        name: team.name,
        owner_id: team.owner_id
      };
    } catch (err) {
      if (err.code) {
        if (err.code === '23505') {
          if (err.constraint === 'unique_team_name') {
            error.throwError('api:team:already_exists', name);
          }
        } else if (err.code === '23503') {
          // Should never happens
          if (err.constraint === 'fk_user') {
            error.throwError('security:user:with_id_not_found', req.getUser().id);
          }
        }
      }
      throw err;
    }
  }

  /**
   * @openapi
   * @action deleteOwnedTeam
   * @description Delete a team owned by the current user
   * @templateParam {string} teamName The name of the team
   * @return {boolean} true
   * @error security:user:not_authenticated
   * @error api:team:team_not_owned
   */
  async deleteOwnedTeam(req) {
    if (req.isAnonymous()) {
      error.throwError('security:user:not_authenticated');
    }

    const teamname = req.getString('teamName');

    const owned = await this.backend.ask('core:team:verify', teamname, req.getUser().id);

    if (!owned) {
      error.throwError('api:team:team_not_owned', teamname);
    }

    return await this.backend.ask('core:team:delete', teamname);
  }

  /**
   * @openapi
   * @action addOwnedTeamUser
   * @description Add a user to a team owned by the current user
   * @templateParam {string} teamName The name of the team
   * @templateParam {number} userId The id of the user
   * @successField {string:"team_name"} name The name of the team
   * @successField {number:1} owner The id of the owner of the team
   * @successField {array:[1,2,3]} members_id The ids of the members of the team
   * @error security:user:not_authenticated
   * @error api:team:team_not_owned
   * @error api:team:user_add_failed
   * @error security:user:with_id_not_found
   */
  async addOwnedTeamUser(req) {
    if (req.isAnonymous()) {
      error.throwError('security:user:not_authenticated');
    }

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
      throw err;
    }
  }

  /**
   * @openapi
   * @action removeOwnedTeamUser
   * @description Remove a user from a team owned by the current user
   * @templateParam {string} teamName The name of the team
   * @templateParam {number} userId The id of the user
   * @successField {string:"team_name"} name The name of the team
   * @successField {number:1} owner The id of the owner of the team
   * @successField {array:[1,2,3]} members_id The ids of the members of the team
   * @error security:user:not_authenticated
   * @error api:team:team_not_owned
   * @error api:team:user_remove_failed
   */
  async removeOwnedTeamUser(req) {
    if (req.isAnonymous()) {
      error.throwError('security:user:not_authenticated');
    }

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

  /**
   * @openapi
   * @action getOwnedTeamByName
   * @description Retrieve informations about a team owned by the current user
   * @templateParam {string} teamName The name of the team
   * @successField {string:"team_name"} name The name of the team
   * @successField {number:1} owner The id of the owner of the team
   * @successField {array:[1,2,3]} members_id The ids of the members of the team
   * @error security:user:not_authenticated
   * @error api:team:team_not_owned
   * @error api:team:not_found
   */
  async getOwnedTeamByName(req) {
    if (req.isAnonymous()) {
      error.throwError('security:user:not_authenticated');
    }

    const teamname = req.getString('teamName');

    const owned = await this.backend.ask('core:team:verify', teamname, req.getUser().id);
    const member = await this.backend.ask('core:team:verify:member', teamname, req.getUser().id);

    if (!owned && !member) {
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