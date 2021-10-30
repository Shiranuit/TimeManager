const BaseController = require('./BaseController');

class AuthController extends BaseController {
  constructor() {
    super([
      { verb: 'post', path: '/_login/:method', action: 'login' },
      { verb: 'post', path: '/_logout', action: 'logout' },
      { verb: 'post', path: '/_register', action: 'register' },
    ]);
  }

  async init() {

  }

  async login(req) {
    
  }

  async logout(req) {

  }

  async register(req) {

  }
};

module.exports = AuthController;