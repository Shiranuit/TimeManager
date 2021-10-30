class RequestInput {
  constructor(request) {
    this.request = request;
    this.url = new URL(request.url, `http://${request.headers.host}`);
    this.body = {};
    this.query = {};

    for (const [key, value] of this.url.searchParams) {
      this.query[key] = value;
    }
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

  getMethod() {
    return this.request.method;
  }
}

module.exports = RequestInput;