const error = require("../../errors");
const RequestInput = require("./requestInput");
const RequestResponse = require("./requestResponse");
const { get, isPlainObject } = require('../../utils/safeObject');

class Request {
  constructor (request, response) {
    this.input = new RequestInput(request);
    this.response = new RequestResponse(response);
    this.routerPart = null;
    this.context = {};
  }

  getJWT() {
    return this.input.body.jwt || null;
  }

  getUser() {
    return this.context.user || null;
  }

  isAnonymous() {
    return !this.getUser() || this.getUser().id === null;
  }

  getAction() {
    return this.input.getAction();
  }

  getController() {
    return this.input.getController();
  }

  setResult(result) {
    this.response.setResult(result);
  }

  setError(error) {
    this.response.setError(error);
  }

  getBody() {
    return this.input.body;
  }

  getArgs() {
    return this.input.args;
  }

  getBoolean(name) {
    return get(this.input.args, name) !== undefined;
  }

  getNumber(name, def = null) {
    return this._getNumber(this.input.args, name, name, def);
  }

  getInteger(name, def = null) {
    return this._getInteger(this.input.args, name, name, def);
  }

  getArray(name, def = null) {
    return this._getArray(this.input.args, name, name, def);
  }

  getString(name, def = null) {
    return this._getString(this.input.args, name, name, def);
  }

  getObject(name, def = null) {
    return this._getObject(this.input.args, name, name, def);
  }

  getBodyBoolean(name) {
    const value = get(this.input.body, name);

    if (value === undefined || value === null) {
      return false;
    } else if (typeof value !== 'boolean') {
      error.throwError('request:invalid:invalid_type', `body.${name}`, 'boolean');
    } else {
      return Boolean(value);
    }
  }

  getBodyNumber(name, def = null) {
    return this._getNumber(this.input.body, name, `body.${name}`, def);
  }
  
  getBodyInteger(name, def = null) {
    return this._getInteger(this.input.body, name, `body.${name}`, def);
  }

  getBodyString(name, def = null) {
    return this._getString(this.input.body, name, `body.${name}`, def);
  }

  getBodyObject(name, def = null) {
    return this._getObject(this.input.body, name, `body.${name}`, def);
  }

  getBodyArray(name, def = null) {
    return this._getArray(this.input.body, name, `body.${name}`, def);
  }


  _getNumber(
    obj,
    name,
    errorName,
    def
  ) {
    let value = get(obj, name);

    if (value === undefined || value === null) {
      if (def !== null) {
        return def;
      }

      error.throwError('request:invalid:missing_argument', errorName);
    }

    const _value = Number.parseFloat(value);

    if (Number.isNaN(_value)) {
      error.throwError('request:invalid:invalid_type', errorName, 'number');
    }

    return _value;
  }

  _getInteger(
    obj,
    name,
    errorName,
    def
  ) {
    let value = get(obj, name);

    if (value === undefined || value === null) {
      if (def !== null) {
        return def;
      }

      error.throwError('request:invalid:missing_argument', errorName);
    }

    const _value = Number.parseInt(value);

    if (Number.isNaN(_value) || !Number.isSafeInteger(_value)) {
      error.throwError('request:invalid:invalid_type', errorName, 'integer');
    }

    return _value;
  }

  _getString(
    obj,
    name,
    errorName,
    def
  ) {
    let value = get(obj, name);

    if (value === undefined || value === null) {
      if (def !== null) {
        return def;
      }

      error.throwError('request:invalid:missing_argument', errorName);
    }

    if (typeof value !== 'string') {
      error.throwError('request:invalid:invalid_type', errorName, 'string');
    }

    return value;
  }

  _getArray(
    obj,
    name,
    errorName,
    def
  ) {
    let value = get(obj, name);

    if (value === undefined || value === null) {
      if (def !== null) {
        return def;
      }

      error.throwError('request:invalid:missing_argument', errorName);
    }

    if (!Array.isArray(value)) {
      error.throwError('request:invalid:invalid_type', errorName, 'array');
    }

    return value;
  }

  _getObject(
    obj,
    name,
    errorName,
    def
  ) {
    let value = get(obj, name);

    if (value === undefined || value === null) {
      if (def !== null) {
        return def;
      }

      error.throwError('request:invalid:missing_argument', errorName);
    }

    if (!isPlainObject(value)) {
      error.throwError('request:invalid:invalid_type', errorName, 'object');
    }

    return value;
  }
}

module.exports = Request;