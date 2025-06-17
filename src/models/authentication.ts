import user from '~/models/user';
import password from '~/models/password';

import { NotFoundError, UnauthorizedError } from '~/infra/errors';

async function getAuthenticatedUser(
  providedEmail: string,
  providedPassword: string,
) {
  try {
    const storedUser = await findUserByEmail(providedEmail);
    await validatePassword(providedPassword, storedUser.password);

    return storedUser;
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      throw new UnauthorizedError({
        message: 'Dados de autenticação não conferem.',
        action: 'Verifique se os dados enviados estão corretos.',
      });
    }

    throw error;
  }

  async function findUserByEmail(providedEmail: string) {
    try {
      const storedUser = await user.findOneByEmail(providedEmail);

      return storedUser;
    } catch (err) {
      if (err instanceof NotFoundError) {
        throw new UnauthorizedError({
          message: 'Email não conferem.',
          action: 'Verifique se este dados está correto.',
        });
      }

      throw err;
    }
  }

  async function validatePassword(
    providedPassword: string,
    storedPassword: string,
  ) {
    const correctPasswordMatch = await password.compare(
      providedPassword,
      storedPassword,
    );

    if (!correctPasswordMatch) {
      throw new UnauthorizedError({
        message: 'Senha não conferem.',
        action: 'Verifique se este dados está correto.',
      });
    }
  }
}

const authentication = {
  getAuthenticatedUser,
};

export default authentication;
