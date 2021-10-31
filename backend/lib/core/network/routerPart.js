class RouterPart {

  constructor (method, path, handler, controller, action) {
    this.method = method;
    this.path = `/${path}`;
    this.handler = handler;
    this.template = this._constructTemplate(path);
    this.templatePath = '/' + this.template.map(item => item.template).join('/');
    this.controller = controller;
    this.action = action;

  }

  _constructTemplate (path) {
    const templatePath = [];
    for (const subPath of path.split('/')) {
      if (subPath[0] === ':') {
        templatePath.push({
          placeholder: true,
          name: subPath.slice(1),
          template: '*'
        });
      } else {
        templatePath.push({
          placeholder: false,
          name: subPath,
          template: subPath,
        });
      }
    }

    return templatePath;
  }

  getMethod () {
    return this.method;
  }

  getPath () {
    return this.path;
  }

  getHandler () {
    return this.handler;
  }

  getTemplatePath () {
    return this.templatePath;
  }

  getTemplate () {
    return this.template;
  }

  getParams (path) {
    const _path = path.split('/').filter(item => item !== '');
    const params = {};

    for (let i = 0; i < this.template.length; i++) {
      if (this.template[i].placeholder) {
        params[this.template[i].name] = _path[i];
      }
    }

    return params;
  }

}

module.exports = RouterPart;