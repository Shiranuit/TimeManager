'use strict';

const BackendError = require('../../errors/backendError');
const InternalError = require('../../errors/internalError');
const assert = require('../../utils/assertType');

class RequestResponse {
  constructor (response) {
    this.response = response;
    this.error = null;
    this.result = {};
  }

  setResult (result) {
    this.result = result;
  }

  setError (error) {
    if (! error || !(error instanceof Error)) {
      throw new InternalError('Cannot set non-error object as a request\'s error');
    }

    if (!(error instanceof BackendError)) {
      this.error = new InternalError(error.message);
      this.error.stack = error.stack;
      return;
    }

    this.error = error;
  }

  getHeader (name) {
    assert.assertString('header name', name);

    if (! name) {
      return true;
    }

    const lowerCased = name.toLowerCase();
    return this.response.headers[lowerCased];
  }

  removeHeader (name) {
    assert.assertString('header name', name);

    if (! name) {
      return true;
    }

    const lowerCased = name.toLowerCase();
    delete this.response.headers[lowerCased];

    return true;
  }

  setHeader (name, value) {
    assert.assertString('header name', name);

    if (! name) {
      return true;
    }

    const lowerCased = name.toLowerCase();
    const _value = String(value);

    switch (lowerCased) {
      case 'age':
      case 'authorization':
      case 'content-length':
      case 'content-type':
      case 'etag':
      case 'expires':
      case 'from':
      case 'host':
      case 'if-modified-since':
      case 'if-unmodified-since':
      case 'last-modified, location':
      case 'max-forwards':
      case 'proxy-authorization':
      case 'referer':
      case 'retry-after':
      case 'user-agent':
        this.response.headers[lowerCased] = _value;
        break;
      case 'set-cookie':
        if (!this.response.headers[lowerCased]) {
          this.response.headers[lowerCased] = [_value];
        }
        else {
          this.response.headers[lowerCased].push(_value);
        }
        break;
      default: {
        if (this.response.headers[lowerCased]) {
          this.response.headers[lowerCased] += ', ' + _value;
        }
        else {
          this.response.headers[lowerCased] = _value;
        }
      }
    }

    return true;
  }

  toJSON () {
    if (this.error) {
      return {
        error: this.error.toJSON()
      };
    }

    return {
      result: this.result
    };
  }
}

module.exports = RequestResponse;