class BackendError extends Error {
  constructor(status, id, message) {
    super(message);
    this.id = id;
    this.status = status || 0;
  }

  toJSON () {
    return {
      id: this.id,
      status: this.status,
      message: this.message,
      stack: this.stack
    };
  }
}

module.exports = BackendError;