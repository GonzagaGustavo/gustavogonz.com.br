import { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';

import controller from '~/infra/controller';
import user from '~/models/user';

const router = createRouter<NextApiRequest, NextApiResponse>();

router.get(getHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(req: NextApiRequest, res: NextApiResponse) {
  const username = req.query.username as string;

  const userFound = await user.findOneByUsername(username);

  return res.status(200).json(userFound);
}
