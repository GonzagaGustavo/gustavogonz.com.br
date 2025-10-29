import { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import controller from '~/infra/controller';

import authentication from '~/models/authentication';
import session from '~/models/session';

const router = createRouter<NextApiRequest, NextApiResponse>();

router.post(postHandler);
router.delete(deleteHandler);

export default router.handler(controller.errorHandlers);

async function postHandler(req: NextApiRequest, res: NextApiResponse) {
  const userInputValues = req.body;

  const authenticatedUser = await authentication.getAuthenticatedUser(
    userInputValues.email,
    userInputValues.password,
  );

  const newSession = await session.create(authenticatedUser.id);

  controller.setSessionCookie(res, newSession.token);

  return res.status(201).json(newSession);
}

async function deleteHandler(req: NextApiRequest, res: NextApiResponse) {
  const sessionToken = req.cookies.session_id;

  const sessionObject = await session.findOneValidByToken(sessionToken);
  const expiredSession = await session.expireById(sessionObject.id);
  controller.clearSessionCookie(res);

  res.status(200).json(expiredSession);
}
