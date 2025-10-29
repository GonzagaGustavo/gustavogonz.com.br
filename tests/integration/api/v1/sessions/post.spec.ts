import { version as uuidVersion } from 'uuid';
import setCookieParser from 'set-cookie-parser';
import { IncomingMessage } from 'node:http';
import { beforeAll, describe, expect, test } from '@jest/globals';
import orchestrator from '~/../tests/orchestrator';
import session from '~/models/session';

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe('POST /api/v1/sessions', () => {
  describe('Anonymous user', () => {
    test('With incorrect `email` but correct `password`', async () => {
      await orchestrator.createUser({
        password: 'senha-correta',
      });

      const res = await fetch('http://localhost:3000/api/v1/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'email.errado@gustavogonz.com.br',
          password: 'senha-correta',
        }),
      });

      expect(res.status).toBe(401);

      const resBody = await res.json();

      expect(resBody).toEqual({
        name: 'UnauthorizedError',
        message: 'Dados de autenticação não conferem.',
        action: 'Verifique se os dados enviados estão corretos.',
        status_code: 401,
      });
    });

    test('With correct `email` but incorrect `password`', async () => {
      await orchestrator.createUser({
        email: 'email.correto@gustavogonz.com.br',
      });

      const res = await fetch('http://localhost:3000/api/v1/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'email.correto@gustavogonz.com.br',
          password: 'senha-incorreta',
        }),
      });

      expect(res.status).toBe(401);

      const resBody = await res.json();

      expect(resBody).toEqual({
        name: 'UnauthorizedError',
        message: 'Dados de autenticação não conferem.',
        action: 'Verifique se os dados enviados estão corretos.',
        status_code: 401,
      });
    });

    test('With incorrect `email` and incorrect `password`', async () => {
      await orchestrator.createUser();

      const res = await fetch('http://localhost:3000/api/v1/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'email.errado@gustavogonz.com.br',
          password: 'senha-incorreta',
        }),
      });

      expect(res.status).toBe(401);

      const resBody = await res.json();

      expect(resBody).toEqual({
        name: 'UnauthorizedError',
        message: 'Dados de autenticação não conferem.',
        action: 'Verifique se os dados enviados estão corretos.',
        status_code: 401,
      });
    });

    test('With correct `email` and correct `password`', async () => {
      const createdUser = await orchestrator.createUser({
        email: 'tudo.correto@gustavogonz.com.br',
        password: 'tudocorreto',
      });

      const res = await fetch('http://localhost:3000/api/v1/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'tudo.correto@gustavogonz.com.br',
          password: 'tudocorreto',
        }),
      });

      expect(res.status).toBe(201);

      const resBody = await res.json();

      expect(resBody).toEqual({
        id: resBody.id,
        token: resBody.token,
        user_id: createdUser.id,
        expires_at: resBody.expires_at,
        created_at: resBody.created_at,
        updated_at: resBody.updated_at,
      });

      expect(uuidVersion(resBody.id)).toBe(4);
      expect(Date.parse(resBody.expires_at)).not.toBeNaN();
      expect(Date.parse(resBody.created_at)).not.toBeNaN();
      expect(Date.parse(resBody.updated_at)).not.toBeNaN();

      const expiresAt = new Date(resBody.expires_at);
      const createdAt = new Date(resBody.created_at);

      expiresAt.setMilliseconds(0);
      createdAt.setMilliseconds(0);

      expect(expiresAt.valueOf() - createdAt.valueOf()).toBe(
        session.EXPIRATION_IN_MILLISECONDS,
      );

      const parsedSetCookie = setCookieParser(
        res as unknown as IncomingMessage,
        { map: true },
      );

      expect(parsedSetCookie.session_id).toEqual({
        name: 'session_id',
        value: resBody.token,
        maxAge: session.EXPIRATION_IN_MILLISECONDS / 1000,
        path: '/',
        httpOnly: true,
      });
    });
  });
});
