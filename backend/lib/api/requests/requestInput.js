'use strict';

class RequestInput {
  constructor (request) {
    this.request = request;
    this.url = new URL(request.url, `http://${request.headers.host}`);
    this.body = {};
    this.args = {};
    this.action = null;
    this.controller = null;

    for (const [key, value] of this.url.searchParams) {
      this.args[key] = value;
    }
  }

  getHeader (key) {
    return this.request.headers[key.toLowerCase()];
  }

  getHeaders () {
    return this.request.headers || {}; 
  }

  getRequest () {
    return this.request;
  }

  getBody () {
    return this.body || {};
  }

  getPath () {
    return this.url.pathname;
  }

  getMethod () {
    return this.request.method;
  }

  getAction () {
    return this.action;
  }

  getController () {
    return this.controller;
  }


}

module.exports = RequestInput;