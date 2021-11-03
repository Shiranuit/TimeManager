'use strict';
/* eslint-disable no-alert, no-console */
class Logger {
  constructor (backend) {
    this.backend = backend;
    this.config = backend.config.logger;
  }

  /**
   * Logs a debug message to the console.
   * @param {string} message
   * @returns
   */
  debug (message) {
    if (!this.config.debug) {
      return;
    }

    const date = new Date().toLocaleString();
    console.debug('\x1b[32m%s\x1b[0m', `[DEBUG][${date}] ${message}`);
  }

  /**
   * Logs an info message to the console.
   * @param {string} message
   * @returns
   */
  info (message) {
    const date = new Date().toLocaleString();
    console.info('\x1b[36m%s\x1b[0m', `[INFO][${date}] ${message}`);
  }

  /**
   * Logs a warn message to the console.
   * @param {string} message
   * @returns
   */
  warn (message) {
    const date = new Date().toLocaleString();
    console.warn('\x1b[33m%s\x1b[0m', `[WARN][${date}] ${message}`);
  }

  /**
   * Logs an error message to the console.
   * @param {string} message
   * @returns
   */
  error (message) {
    const date = new Date().toLocaleString();
    console.error('\x1b[31m%s\x1b[0m', `[ERROR][${date}] ${message}`);
  }
}

/* eslint-enable no-alert, no-console */

module.exports = Logger;