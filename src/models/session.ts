import crypto from 'node:crypto';
import database from '~/infra/database';
import { UnauthorizedError } from '~/infra/errors';

const EXPIRATION_IN_MILLISECONDS = 60 * 60 * 24 * 30 * 1000; // 30 Days

type Session = {
  id: string;
  token: string;
  user_id: string;
  expires_at: Date;
  created_at: Date;
  updated_at: Date;
};

async function findOneValidByToken(
  sessionToken: string | undefined,
): Promise<Session> {
  if (!sessionToken) {
    throw new UnauthorizedError({
      message: 'Usuário não possui sessão ativa.',
      action: 'Verifique se o usuário está autenticado e tente novamente.',
    });
  }

  const sessionFound = await runSelectQuery(sessionToken);

  return sessionFound;

  async function runSelectQuery(sessionToken: string) {
    const results = await database.query({
      text: `
        SELECT
          *
        FROM
          sessions
        WHERE
          token = $1
          AND expires_at > NOW()
        LIMIT
          1
      ;`,
      values: [sessionToken],
    });

    if (results.rowCount === 0) {
      throw new UnauthorizedError({
        message: 'Usuário não possui sessão ativa.',
        action: 'Verifique se o usuário está autenticado e tente novamente.',
      });
    }

    return results.rows[0];
  }
}

async function create(userId: string): Promise<Session> {
  const token = crypto.randomBytes(48).toString('hex');
  const expiresAt = new Date(Date.now() + EXPIRATION_IN_MILLISECONDS);
  const newSession = await runInsertQuery(token, userId, expiresAt);

  return newSession;

  async function runInsertQuery(
    token: string,
    userId: string,
    expiresAt: Date,
  ) {
    const results = await database.query({
      text: `
        INSERT INTO
          sessions (token, user_id, expires_at)
        VALUES
          ($1, $2, $3)
        RETURNING
          *
        ;`,
      values: [token, userId, expiresAt],
    });

    return results.rows[0];
  }
}

async function renew(sessionId: string): Promise<Session> {
  const expiresAt = new Date(Date.now() + EXPIRATION_IN_MILLISECONDS);

  const renewedSession = await runUpdateQuery(sessionId, expiresAt);
  return renewedSession;

  async function runUpdateQuery(sessionId: string, expiresAt: Date) {
    const results = await database.query({
      text: `
        UPDATE
          sessions
        SET
          expires_at = $2,
          updated_at = NOW()
        WHERE
          id = $1
        RETURNING
          *
        ;`,
      values: [sessionId, expiresAt],
    });

    return results.rows[0];
  }
}

async function expireById(sessionId: string): Promise<Session> {
  const expiredSession = await runUpdateQuery(sessionId);
  return expiredSession;

  async function runUpdateQuery(sessionId: string) {
    const results = await database.query({
      text: `
        UPDATE
          sessions
        SET
          expires_at = NOW(),
          updated_at = NOW()
        WHERE
          id = $1
        RETURNING
          *
        ;`,
      values: [sessionId],
    });

    return results.rows[0];
  }
}

const session = {
  findOneValidByToken,
  create,
  renew,
  expireById,
  EXPIRATION_IN_MILLISECONDS,
};

export default session;
