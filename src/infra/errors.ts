export class InternalServerError extends Error {
  action = 'Contact Support';
  statusCode = 500;

  constructor({ cause }: { cause: unknown }) {
    super('An unexpected internal error occurred', { cause });
    this.name = 'InternalServerError';
  }

  toJson() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.statusCode,
    };
  }
}
