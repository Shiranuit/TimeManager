const error = require('../../errors');
const RouterPart = require('./routerPart');

class Router {
  constructor() {
    this.routes = new Map();
    this.backend = null;
  }

  async init(backend) {
    this.backend = backend;
  }

  attach(verb, path, handler) {
    const _path = this._cleanupPath(path);
    const _verb = verb.toLowerCase();
    const part = new RouterPart(verb, _path, handler);
    
    if (!this.routes.has(_verb)) {
      this.routes.set(_verb, new Map());
    }

    const verbRoutes = this.routes.get(_verb);

    if (!verbRoutes.has(part.getTemplate().length)) {
      verbRoutes.set(part.getTemplate().length, [part]);
      return;
    }

    for (const route of verbRoutes.get(part.getTemplate().length)) {
      if (route.getTemplatePath() === part.getTemplatePath()) {
        error.throwError('network:http:duplicate_url', path);
      }
    }

    verbRoutes.get(part.getTemplate().length).push(part);
  }

  _cleanupPath(path) {
    return path.split('/').filter(item => item !== '').join('/');
  }

  find(verb, path) {
    const _verb = verb.toLowerCase();
    if (!this.routes.has(_verb)) {
      error.throwError('network:http:url_not_found', `${verb.toUpperCase()} ${path}`);
    }

    const _path = this._cleanupPath(path);
    const verbRoutes = this.routes.get(_verb);

    const pathSection = _path.split('/');
    if (!verbRoutes.has(pathSection.length)) {
      error.throwError('network:http:url_not_found', `${verb.toUpperCase()} ${path}`);
    }

    let routes = verbRoutes.get(pathSection.length);
    for (let i = 0; i < pathSection.length; i++) {
      routes = routes.filter(route => {
        const template = route.getTemplate();
        if (template[i].placeholder) {
          return true;
        }  

        return template[i].name === pathSection[i];
      });
    }

    if (routes.length === 0) {
      error.throwError('network:http:url_not_found', `${verb.toUpperCase()} ${path}`);
    }

    if (routes.length === 1) {
      return routes[0];
    }

    let route = null;
    let minPlaceholders = -1
    for (let i = 0; i < routes.length; i++) {
      let count = 0;
      for (const subPath of routes[i].getTemplate()) {
        if (subPath.placeholder) {
          count++;
        }
      }

      if (minPlaceholders === -1 || count < minPlaceholders) {
        route = routes[i];
        minPlaceholders = count;
      }
    }

    return route;
  }

  async execute(req) {
    const route = this.find(req.input.getMethod(), req.getPath());
    const params = route.getParams(req.getPath());
    req.input.body = {...req.input.body, ...params};
    return route.handler(req);
  }


}

module.exports = Router;