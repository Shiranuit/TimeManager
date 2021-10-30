const util = require('util');
const BackendError = require('./backendError');

const errorCodes = require('./errorCodes');
const InternalError = require('./internalError');

function throwError (errorId, ...errorMessage) {
  const error = errorCodes[errorId];
  if (! error) {
    throw new InternalError(`Error code not found: ${errorId}`);
  }

  throw new error['type'](util.format(error.message, ...errorMessage), errorId);
}

function getError (errorId, ...errorMessage) {
  const error = errorCodes[errorId];
  if (! error) {
    throw new InternalError(`Error code not found: ${errorId}`);
  }

  return new error['type'](util.format(error.message, ...errorMessage), errorId);
}

module.exports = {
  throwError,
  getError
}