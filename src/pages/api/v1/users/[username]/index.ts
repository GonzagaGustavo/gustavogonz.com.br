import { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';

import controller from '~/infra/controller';
import user from '~/models/user';

const router = createRouter<NextApiRequest, NextApiResponse>();

router.get(getHandler);
router.patch(patchHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(req: NextApiRequest, res: NextApiResponse) {
  const username = req.query.username as string;

  const userFound = await user.findOneByUsername(username);

  return res.status(200).json(userFound);
}

async function patchHandler(req: NextApiRequest, res: NextApiResponse) {
  const username = req.query.username as string;
  const userInputValues = req.body;

  const updatedUser = await user.update(username, userInputValues);

  return res.status(200).json(updatedUser);
}
