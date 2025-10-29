import { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';

import controller from '~/infra/controller';
import { UnauthorizedError } from '~/infra/errors';
import session from '~/models/session';
import user from '~/models/user';

const router = createRouter<NextApiRequest, NextApiResponse>();

router.get(getHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(req: NextApiRequest, res: NextApiResponse) {
  const sessionToken = req.cookies.session_id;

  if (!sessionToken) {
    throw new UnauthorizedError({
      message: 'Usuário não possui sessão ativa.',
      action: 'Verifique se o usuário está autenticado e tente novamente.',
    });
  }

  const sessionObject = await session.findOneValidByToken(sessionToken);
  const renewedSessionObject = await session.renew(sessionObject.id);
  await controller.setSessionCookie(res, renewedSessionObject.token);

  const userFound = await user.findOneById(sessionObject.user_id);

  res.setHeader(
    'Cache-Control',
    'no-store, no-cache, max-age=0, must-revalidade',
  );
  return res.status(200).json(userFound);
}
