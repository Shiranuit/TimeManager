class BaseController {
  constructor (actions = []) {
    this.__actions = new Set(actions);
  }

  async init() {

  }
}

module.exports = BaseController;