const InternalError = require('./internalError');
const BadRequestError = require('./badRequestError');
const ServiceUnavailableError = require('./serviceUnavailableError');
const SecurityError = require('./securityError');
const ApiError = require('./apiError');

module.exports = {
  'request:discarded:shutdown': {
    message: 'Backend is shutting down',
    type: ServiceUnavailableError,
  },
  'request:invalid:body': {
    message: 'Invalid request body',
    type: BadRequestError,
  },
  'request:invalid:missing_argument': {
    message: 'Missing argument "%s"',
    type: BadRequestError,
  },
  'request:invalid:invalid_type': {
    message: 'Wrong type for argument "%s" (expected: %s)',
    type: BadRequestError,
  },
  'request:invalid:email_format': {
    message: 'Invalid email format',
    type: BadRequestError,
  },
  'network:http:duplicate_url': {
    message: 'Duplicate URL: "%s"',
    type: InternalError,
  },
  'network:http:url_not_found': {
    message: 'URL not found: "%s"',
    type: BadRequestError,
  },
  'security:user:username_taken': {
    message: 'Username already taken',
    type: SecurityError,
  },
  'security:user:email_taken': {
    message: 'Email already taken',
    type: SecurityError,
  },
  'security:user:not_found': {
    message: 'User "%s" not found',
    type: SecurityError,
  },
  'security:user:with_idnot_found': {
    message: 'User with id "%s" not found',
    type: SecurityError,
  },
  'security:user:invalid_credentials': {
    message: 'Invalid credentials',
    type: SecurityError,
  },
  'security:user:password_too_short': {
    message: 'Password too short, should be at least %s characters',
    type: SecurityError,
  },
  'security:user:password_too_weak': {
    message: 'Password too weak, should include at least 1 Capital letter and 1 Number',
    type: SecurityError,
  },
  'security:user:username_too_short': {
    message: 'Username too short, should be at least %s characters',
    type: SecurityError,
  },
  'security:token:invalid': {
    message: 'Invalid token',
    type: SecurityError,
  },
  'security:token:expired': {
    message: 'Token expired',
    type: SecurityError,
  },
  'security:user:not_authenticated': {
    message: 'User not authenticated',
    type: SecurityError,
  },
  'api:workingtime:creation_failed': {
    message: 'Failed to create working time',
    type: ApiError,
  },
  'api:workingtime:not_found': {
    message: 'No working time found with id "%s" for user_id "%s"',
    type: ApiError,
  }
};