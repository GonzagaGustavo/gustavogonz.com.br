export class InternalServerError extends Error {
  action = 'Contact Support';
  statusCode: number;

  constructor({ cause, statusCode }: { cause: unknown; statusCode?: number }) {
    super('An unexpected internal error occurred', { cause });
    this.name = 'InternalServerError';
    this.statusCode = statusCode || 500;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.statusCode,
    };
  }
}

export class ServiceError extends Error {
  action = 'Check if the service is available.';
  statusCode = 503;

  constructor({ cause, message }: { cause: unknown; message?: string }) {
    super(message || 'Service currently unavailable.', { cause });
    this.name = 'ServiceError';
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.statusCode,
    };
  }
}

export class MethodNotAllowedError extends Error {
  action = 'Check if the http method is valid for this endpoint.';
  statusCode = 405;

  constructor() {
    super('Method not allowed for this endpoint.');
    this.name = 'MethodNotAllowedError';
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.statusCode,
    };
  }
}

export class ValidationError extends Error {
  action: string;
  statusCode = 400;

  constructor({
    cause,
    message,
    action,
  }: {
    cause?: unknown;
    message?: string;
    action?: string;
  }) {
    super(message || 'A validation error occurred.', { cause });
    this.name = 'ValidationError';
    this.action = action || 'Adjust the data sent and try again.';
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.statusCode,
    };
  }
}
