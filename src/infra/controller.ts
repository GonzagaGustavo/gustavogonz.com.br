import { NextApiRequest, NextApiResponse } from 'next';

import { InternalServerError, MethodNotAllowedError } from '~/infra/errors';

function onNoMatchHandler(req: NextApiRequest, res: NextApiResponse) {
  const publicErrorObject = new MethodNotAllowedError();

  res.status(publicErrorObject.statusCode).json(publicErrorObject);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function onErrorHandler(error: any, req: NextApiRequest, res: NextApiResponse) {
  const publicErrorObject = new InternalServerError({
    statusCode: error.statusCode,
    cause: error,
  });

  console.error(publicErrorObject);

  res.status(publicErrorObject.statusCode).json(publicErrorObject);
}

const controller = {
  errorHandlers: {
    onNoMatch: onNoMatchHandler,
    onError: onErrorHandler,
  },
};

export default controller;
