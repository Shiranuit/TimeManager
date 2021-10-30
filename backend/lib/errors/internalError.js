const BackendError = require('./backendError');

class InternalError extends BackendError {
  constructor(message, id = 0) {
    super(500, id, message);
  }
}

module.exports = InternalError;