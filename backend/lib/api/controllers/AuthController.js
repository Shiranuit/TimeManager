const BaseController = require('./BaseController');

class AuthController extends BaseController {
  constructor() {
    super([
      { verb: 'post', path: '/_login/:method', action: 'login' },
      { verb: 'post', path: '/_logout', action: 'logout' },
      { verb: 'post', path: '/_register', action: 'register' },
    ]);
  }

  async login(req) {
    
    return await this.backend.ask('postgres:query', 'SELECT * FROM users;');
  }

  async logout(req) {

  }

  async register(req) {

  }
};

module.exports = AuthController;