const BackendError = require('./backendError');

class ServiceUnavailable extends BackendError {
  constructor(message, id = 0) {
    super(501, id, message);
  }
}

module.exports = ServiceUnavailable;