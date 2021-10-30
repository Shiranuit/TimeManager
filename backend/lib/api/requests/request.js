const InternalError = require("../../errors/internalError");
const RequestInput = require("./requestInput");
const RequestResponse = require("./requestResponse");

class Request {
  constructor (request, response) {
    this.input = new RequestInput(request);
    this.response = new RequestResponse(response);
    this.error = null;
  }

  setError (error) {
    this.response.setError(error);
  }

  setResult (result) {
    this.response.setResult(result);
  }

  getBody() {
    return this.input.getBody();
  }

  getPath () {
    return this.input.getPath();
  }

  getQuery () {
    return this.input.getQuery();
  }

}

module.exports = Request;