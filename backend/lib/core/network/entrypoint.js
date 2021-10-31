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
    this.server.listen(this.backend.config.http.port);
    this.backend.logger.info(`Backend is listening on port: ${this.backend.config.http.port}`);
  }

  async stopListening () {

    let resolve = null;
    const promise = new Promise((res, rej) => {
      resolve = res;
    });

    this.server.close(() => {
      resolve();
    });

    return promise;
  }

  execute (req, res) {
    const request = new Request(req, res);
    this.backend.logger.debug(`${request.input.getMethod()} ${request.input.getPath()} from ${req.connection.remoteAddress}`);

    const fullContent = [];
    req.on('data', data => {
      fullContent.push(data.toString());
    });

    req.on('end', () => {
      try {
        if (fullContent.length > 0) {
          request.input.body = JSON.parse(fullContent.join('')) || {};
        }
      } catch (e) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        const err = error.getError('request:invalid:body');
        res.end(JSON.stringify({ status: err.status, error: err.message, stacktrace: e.stack }));
        return;
      }

      try {
      const routerPart = this.backend.router.find(request.input.getMethod(), request.input.getPath());

      request.input.action = routerPart.action;
      request.input.controller = routerPart.controller;
      request.routerPart = routerPart;

      for (const [paramName, paramValue] of Object.entries(routerPart.getParams(request.input.getPath()))) {
        request.input.args[paramName] = paramValue;
      }
      } catch (e) {
        request.response.setError(e);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(request.response.toJSON()));
        return;
      }

      this.backend.funnel.execute(request, (error, result) => {
        const _res = result || request;
  
        if (error && !_res.response.error) {
          _res.response.setError(error);
        }
  
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(_res.response.toJSON()));
      });
    });
  }
}

module.exports = EntryPoint;