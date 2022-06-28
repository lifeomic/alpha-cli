export class ValidationError extends Error {
  constructor (
    public stdout: string,
    public stderr: string,
  ) {
    super('An error was detected during response validation');
    this.name = 'ValidationError';
  }
}
