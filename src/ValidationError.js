class ValidationError extends Error {
  constructor (stdout, stderr) {
    super('An error was detected during response validation');
    this.name = 'ValidationError';
    this.stderr = stderr;
    this.stdout = stdout;
  }
}

module.exports = ValidationError;
