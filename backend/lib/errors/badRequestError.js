const BackendError = require('./backendError');

class BadRequest extends BackendError {
  constructor(message, id = 0) {
    super(400, id, message);
  }
}

module.exports = BadRequest;