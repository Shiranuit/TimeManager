const InternalError = require('./internalError');
const BadRequestError = require('./badRequestError');
const ServiceUnavailableError = require('./serviceUnavailableError');

module.exports = {
  'request:discarded:shutdown': {
    message: 'Backend is shutting down',
    type: ServiceUnavailableError,
  },
  'request:invalid:body': {
    message: 'Invalid request body',
    type: BadRequestError,
  },
  'network:http:duplicate_url': {
    message: 'Duplicate URL: %s',
    type: InternalError,
  },
  'network:http:url_not_found': {
    message: 'URL not found: %s',
    type: BadRequestError,
  }
};