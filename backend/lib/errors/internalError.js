const { cp } = require('fs');
const BackendError = require('./backendError');

class InternalError extends BackendError {
  constructor (message, id = '') {
    super(500, id, message, 'InternalError');
  }
}

module.exports = InternalError;