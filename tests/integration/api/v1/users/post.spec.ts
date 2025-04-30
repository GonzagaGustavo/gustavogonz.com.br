import { version as uuidVersion } from 'uuid';
import { beforeAll, describe, expect, test } from '@jest/globals';
import orchestrator from '../../../../orchestrator';
import user from '~/models/user';
import password from '~/models/password';

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe('POST /api/v1/users', () => {
  describe('Anonymous user', () => {
    test('With unique and valid data', async () => {
      const res = await fetch('http://localhost:3000/api/v1/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'gustavo',
          email: 'contato@gustavogonz.com.br',
          password: 'senha123',
        }),
      });

      expect(res.status).toBe(201);

      const resBody = await res.json();

      expect(resBody).toEqual({
        id: resBody.id,
        username: 'gustavo',
        email: 'contato@gustavogonz.com.br',
        password: resBody.password,
        created_at: resBody.created_at,
        updated_at: resBody.updated_at,
      });

      expect(uuidVersion(resBody.id)).toBe(4);
      expect(Date.parse(resBody.created_at)).not.toBeNaN();
      expect(Date.parse(resBody.updated_at)).not.toBeNaN();

      const userInDatabase = await user.findOneByUsername('gustavo');
      const correctPasswordMatch = await password.compare(
        'senha123',
        userInDatabase.password,
      );
      const incorrectPasswordMatch = await password.compare(
        'SenhaErrada',
        userInDatabase.password,
      );

      expect(correctPasswordMatch).toBe(true);
      expect(incorrectPasswordMatch).toBe(false);
    });

    test("With duplicated 'email'", async () => {
      const res1 = await fetch('http://localhost:3000/api/v1/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'emailduplicated1',
          email: 'duplicated@gustavogonz.com.br',
          password: 'senha123',
        }),
      });

      expect(res1.status).toBe(201);

      const res2 = await fetch('http://localhost:3000/api/v1/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'emailduplicated2',
          email: 'Duplicated@gustavogonz.com.br',
          password: 'senha123',
        }),
      });

      expect(res2.status).toBe(400);

      const res2Body = await res2.json();

      expect(res2Body).toEqual({
        name: 'ValidationError',
        message: 'O email informado já está sendo utilizado.',
        action: 'Utilize outro email para esta operação.',
        status_code: 400,
      });
    });

    test("With duplicated 'username'", async () => {
      const res1 = await fetch('http://localhost:3000/api/v1/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'duplicated',
          email: 'usernameduplicated1@gustavogonz.com.br',
          password: 'senha123',
        }),
      });

      expect(res1.status).toBe(201);

      const res2 = await fetch('http://localhost:3000/api/v1/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'Duplicated',
          email: 'usernameduplicated2@gustavogonz.com.br',
          password: 'senha123',
        }),
      });

      expect(res2.status).toBe(400);

      const res2Body = await res2.json();

      expect(res2Body).toEqual({
        name: 'ValidationError',
        message: 'O username informado já está sendo utilizado.',
        action: 'Utilize outro username para esta operação.',
        status_code: 400,
      });
    });
  });
});
