import { version as uuidVersion } from 'uuid';
import user from '~/models/user';
import password from '~/models/password';

import { beforeAll, describe, expect, test } from '@jest/globals';
import orchestrator from '~/../tests/orchestrator';

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe('PATCH /api/v1/users/[username]', () => {
  describe('Anonymous user', () => {
    test("With nonexistent 'username'", async () => {
      const res = await fetch(
        'http://localhost:3000/api/v1/users/UsuarioInexistente',
        { method: 'PATCH' },
      );

      expect(res.status).toBe(404);

      const resBody = await res.json();

      expect(resBody).toEqual({
        name: 'NotFoundError',
        message: 'O username informado não foi encontrado no sistema.',
        action: 'Verifique se o username está digitado corretamente.',
        status_code: 404,
      });
    });

    test("With duplicated 'username'", async () => {
      const user1Res = await fetch('http://localhost:3000/api/v1/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'user1',
          email: 'user1@gustavogonz.com.br',
          password: 'senha123',
        }),
      });

      expect(user1Res.status).toBe(201);

      const user2Res = await fetch('http://localhost:3000/api/v1/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'user2',
          email: 'user2@gustavogonz.com.br',
          password: 'senha123',
        }),
      });

      expect(user2Res.status).toBe(201);

      const res = await fetch('http://localhost:3000/api/v1/users/user2', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'user1',
        }),
      });

      expect(res.status).toBe(400);

      const resBody = await res.json();

      expect(resBody).toEqual({
        name: 'ValidationError',
        message: 'O username informado já está sendo utilizado.',
        action: 'Utilize outro username para esta operação.',
        status_code: 400,
      });
    });

    test("With duplicated 'email'", async () => {
      const email1Res = await fetch('http://localhost:3000/api/v1/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'email1',
          email: 'email1@gustavogonz.com.br',
          password: 'senha123',
        }),
      });

      expect(email1Res.status).toBe(201);

      const email2Res = await fetch('http://localhost:3000/api/v1/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'email2',
          email: 'email2@gustavogonz.com.br',
          password: 'senha123',
        }),
      });

      expect(email2Res.status).toBe(201);

      const res = await fetch('http://localhost:3000/api/v1/users/email2', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'email1@gustavogonz.com.br',
        }),
      });

      expect(res.status).toBe(400);

      const resBody = await res.json();

      expect(resBody).toEqual({
        name: 'ValidationError',
        message: 'O email informado já está sendo utilizado.',
        action: 'Utilize outro email para esta operação.',
        status_code: 400,
      });
    });

    test("With unique 'username'", async () => {
      const user1Res = await fetch('http://localhost:3000/api/v1/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'uniqueUser1',
          email: 'uniqueUser1@gustavogonz.com.br',
          password: 'senha123',
        }),
      });

      expect(user1Res.status).toBe(201);

      const res = await fetch(
        'http://localhost:3000/api/v1/users/uniqueUser1',
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: 'uniqueUser2',
          }),
        },
      );

      expect(res.status).toBe(200);

      const resBody = await res.json();

      expect(resBody).toEqual({
        id: resBody.id,
        username: 'uniqueUser2',
        email: 'uniqueUser1@gustavogonz.com.br',
        password: resBody.password,
        created_at: resBody.created_at,
        updated_at: resBody.updated_at,
      });

      expect(uuidVersion(resBody.id)).toBe(4);
      expect(Date.parse(resBody.created_at)).not.toBeNaN();
      expect(Date.parse(resBody.updated_at)).not.toBeNaN();

      expect(resBody.updated_at > resBody.created_at).toBe(true);
    });

    test("With unique 'email'", async () => {
      const user1Res = await fetch('http://localhost:3000/api/v1/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'uniqueEmail1',
          email: 'uniqueEmail1@gustavogonz.com.br',
          password: 'senha123',
        }),
      });

      expect(user1Res.status).toBe(201);

      const res = await fetch(
        'http://localhost:3000/api/v1/users/uniqueEmail1',
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: 'uniqueEmail2@gustavogonz.com.br',
          }),
        },
      );

      expect(res.status).toBe(200);

      const resBody = await res.json();

      expect(resBody).toEqual({
        id: resBody.id,
        username: 'uniqueEmail1',
        email: 'uniqueEmail2@gustavogonz.com.br',
        password: resBody.password,
        created_at: resBody.created_at,
        updated_at: resBody.updated_at,
      });

      expect(uuidVersion(resBody.id)).toBe(4);
      expect(Date.parse(resBody.created_at)).not.toBeNaN();
      expect(Date.parse(resBody.updated_at)).not.toBeNaN();

      expect(resBody.updated_at > resBody.created_at).toBe(true);
    });

    test("With new 'password'", async () => {
      const user1Res = await fetch('http://localhost:3000/api/v1/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'newPassword1',
          email: 'newPassword1@gustavogonz.com.br',
          password: 'newPassword1',
        }),
      });

      expect(user1Res.status).toBe(201);

      const res = await fetch(
        'http://localhost:3000/api/v1/users/newPassword1',
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            password: 'newPassword2',
          }),
        },
      );

      expect(res.status).toBe(200);

      const resBody = await res.json();

      expect(resBody).toEqual({
        id: resBody.id,
        username: 'newPassword1',
        email: 'newPassword1@gustavogonz.com.br',
        password: resBody.password,
        created_at: resBody.created_at,
        updated_at: resBody.updated_at,
      });

      expect(uuidVersion(resBody.id)).toBe(4);
      expect(Date.parse(resBody.created_at)).not.toBeNaN();
      expect(Date.parse(resBody.updated_at)).not.toBeNaN();

      expect(resBody.updated_at > resBody.created_at).toBe(true);

      const userInDatabase = await user.findOneByUsername('newPassword1');
      const correctPasswordMatch = await password.compare(
        'newPassword2',
        userInDatabase.password,
      );
      const incorrectPasswordMatch = await password.compare(
        'newPassword1',
        userInDatabase.password,
      );

      expect(correctPasswordMatch).toBe(true);
      expect(incorrectPasswordMatch).toBe(false);
    });
  });
});
