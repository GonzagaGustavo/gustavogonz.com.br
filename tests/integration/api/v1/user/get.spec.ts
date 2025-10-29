import { beforeAll, describe, expect, jest, test } from '@jest/globals';
import { version as uuidVersion } from 'uuid';
import setCookieParser from 'set-cookie-parser';
import { IncomingMessage } from 'node:http';
import orchestrator from '~/../tests/orchestrator';

import session from '~/models/session';

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe('GET /api/v1/user', () => {
  describe('Default user', () => {
    test('With valid session', async () => {
      const createdUser = await orchestrator.createUser({
        username: 'UserWithValidSession',
      });

      const sessionObject = await orchestrator.createSession(createdUser.id);

      const response = await fetch('http://localhost:3000/api/v1/user', {
        headers: {
          Cookie: `session_id=${sessionObject.token}`,
        },
      });

      expect(response.status).toBe(200);

      const cacheControl = response.headers.get('Cache-Control');
      expect(cacheControl).toBe(
        'no-store, no-cache, max-age=0, must-revalidade',
      );

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: createdUser.id,
        username: 'UserWithValidSession',
        email: createdUser.email,
        password: createdUser.password,
        created_at: createdUser.created_at.toISOString(),
        updated_at: createdUser.updated_at.toISOString(),
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      const renewedSessionObject = await session.findOneValidByToken(
        sessionObject.token,
      );

      expect(
        renewedSessionObject.expires_at > sessionObject.expires_at,
      ).toEqual(true);
      expect(
        renewedSessionObject.updated_at > sessionObject.updated_at,
      ).toEqual(true);

      // Set-Cookie assertions
      const parsedSetCookie = setCookieParser(
        response as unknown as IncomingMessage,
        { map: true },
      );

      expect(parsedSetCookie.session_id).toEqual({
        name: 'session_id',
        value: renewedSessionObject.token,
        maxAge: session.EXPIRATION_IN_MILLISECONDS / 1000,
        path: '/',
        httpOnly: true,
      });
    });

    test('With 1 minute before session expiration', async () => {
      jest.useFakeTimers({
        now: new Date(
          Date.now() - session.EXPIRATION_IN_MILLISECONDS + 60 * 1000, // 1 minute before expiration
        ),
      });

      const createdUser = await orchestrator.createUser({
        username: 'UserWith1MinSessionExpiration',
      });

      const sessionObject = await orchestrator.createSession(createdUser.id);

      jest.useRealTimers();

      const response = await fetch('http://localhost:3000/api/v1/user', {
        headers: {
          Cookie: `session_id=${sessionObject.token}`,
        },
      });

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: createdUser.id,
        username: 'UserWith1MinSessionExpiration',
        email: createdUser.email,
        password: createdUser.password,
        created_at: createdUser.created_at.toISOString(),
        updated_at: createdUser.updated_at.toISOString(),
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      const renewedSessionObject = await session.findOneValidByToken(
        sessionObject.token,
      );

      expect(
        renewedSessionObject.expires_at > sessionObject.expires_at,
      ).toEqual(true);
      expect(
        renewedSessionObject.updated_at > sessionObject.updated_at,
      ).toEqual(true);

      // Set-Cookie assertions
      const parsedSetCookie = setCookieParser(
        response as unknown as IncomingMessage,
        { map: true },
      );

      expect(parsedSetCookie.session_id).toEqual({
        name: 'session_id',
        value: renewedSessionObject.token,
        maxAge: session.EXPIRATION_IN_MILLISECONDS / 1000,
        path: '/',
        httpOnly: true,
      });
    });

    test('With nonexistent session', async () => {
      const nonexistentSession =
        'ae6c6e53029e21f860304fee1b98e5795f037b160b84e33d26af0a5b28b9dd3e22eebe4a4fc5e4da14a31b2dcf8ad891';

      const response = await fetch('http://localhost:3000/api/v1/user', {
        headers: {
          Cookie: `session_id=${nonexistentSession}`,
        },
      });

      expect(response.status).toBe(401);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: 'UnauthorizedError',
        message: 'Usuário não possui sessão ativa.',
        action: 'Verifique se o usuário está autenticado e tente novamente.',
        status_code: 401,
      });
    });

    test('With expired session', async () => {
      jest.useFakeTimers({
        now: new Date(Date.now() - session.EXPIRATION_IN_MILLISECONDS),
      });

      const createdUser = await orchestrator.createUser({
        username: 'UserWithExpiredSession',
      });

      const sessionObject = await orchestrator.createSession(createdUser.id);

      jest.useRealTimers();

      const response = await fetch('http://localhost:3000/api/v1/user', {
        headers: {
          Cookie: `session_id=${sessionObject.token}`,
        },
      });

      expect(response.status).toBe(401);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: 'UnauthorizedError',
        message: 'Usuário não possui sessão ativa.',
        action: 'Verifique se o usuário está autenticado e tente novamente.',
        status_code: 401,
      });
    });
  });
});
