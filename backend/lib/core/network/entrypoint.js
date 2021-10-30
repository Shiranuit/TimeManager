const http = require('http');
const Request = require('../../api/requests/request');
const error = require('../../errors');

class EntryPoint {
  constructor() {
    this.server = http.createServer(this.execute.bind(this));
    this.backend = null;
  }

  async init (backend) {
    this.backend = backend;
  }

  async startListening () {
    this.server.listen(this.backend.config.port);
  }

  execute (req, res) {
    const request = new Request(req, res);

    const fullContent = [];
    req.on('data', data => {
      fullContent.push(data.toString());
    });

    req.on('end', () => {
      try {
        if (fullContent.length > 0) {
          req.input.body = JSON.parse(fullContent.join('')) || {};
        }
      } catch (e) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        const err = error.getError('request:invalid:body');
        res.end(JSON.stringify({ status: err.status, error: err.message, stacktrace: e.stack }));
        return;
      }

      this.backend.funnel.execute(request, (error, result) => {
        const _res = result || request;
  
        if (error && !_res.response.error) {
          _res.setError(error);
        }
  
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(_res.response.toJSON()));
      });
    });
  }
}

module.exports = EntryPoint;