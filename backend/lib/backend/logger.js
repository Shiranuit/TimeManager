class Logger {
  constructor(backend) {
    this.backend = backend;
    this.config = backend.config.logger;
  }

  debug(message) {
    if (!this.config.debug) {
      return;
    }

    const date = new Date().toLocaleString();
    console.debug('\x1b[32m%s\x1b[0m', `[DEBUG][${date}] ${message}`);
  }

  info(message) {
    const date = new Date().toLocaleString();
    console.info('\x1b[36m%s\x1b[0m', `[INFO][${date}] ${message}`);
  }

  warn(message) {
    const date = new Date().toLocaleString();
    console.warn('\x1b[33m%s\x1b[0m', `[WARN][${date}] ${message}`);
  }

  error(message) {
    const date = new Date().toLocaleString();
    console.error('\x1b[31m%s\x1b[0m', `[ERROR][${date}] ${message}`);
  }
}

module.exports = Logger;