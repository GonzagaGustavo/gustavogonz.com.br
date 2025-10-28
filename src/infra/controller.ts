import { NextApiRequest, NextApiResponse } from 'next';
import * as cookie from 'cookie';
import session from '~/models/session';
import {
  InternalServerError,
  MethodNotAllowedError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from '~/infra/errors';

function onNoMatchHandler(req: NextApiRequest, res: NextApiResponse) {
  const publicErrorObject = new MethodNotAllowedError();

  res.status(publicErrorObject.statusCode).json(publicErrorObject);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function onErrorHandler(error: any, req: NextApiRequest, res: NextApiResponse) {
  if (
    error instanceof ValidationError ||
    error instanceof NotFoundError ||
    error instanceof UnauthorizedError
  ) {
    return res.status(error.statusCode).json(error);
  }

  const publicErrorObject = new InternalServerError({
    cause: error,
  });

  console.error(publicErrorObject);

  res.status(publicErrorObject.statusCode).json(publicErrorObject);
}

async function setSessionCookie(res: NextApiResponse, sessionToken: string) {
  const setCookie = cookie.serialize('session_id', sessionToken, {
    path: '/',
    maxAge: session.EXPIRATION_IN_MILLISECONDS / 1000,
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
  });
  res.setHeader('Set-Cookie', setCookie);
}

const controller = {
  errorHandlers: {
    onNoMatch: onNoMatchHandler,
    onError: onErrorHandler,
  },
  setSessionCookie,
};

export default controller;
