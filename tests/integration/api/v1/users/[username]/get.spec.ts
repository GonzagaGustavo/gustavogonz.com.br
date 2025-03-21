import { version as uuidVersion } from 'uuid';
import { beforeAll, describe, expect, test } from '@jest/globals';
import orchestrator from '~/../tests/orchestrator';

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe('GET /api/v1/users/[username]', () => {
  describe('Anonymous user', () => {
    test('With exact case match', async () => {
      const res1 = await fetch('http://localhost:3000/api/v1/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'MesmoCase',
          email: 'mesmo.case@gustavogonz.com.br',
          password: 'senha123',
        }),
      });

      expect(res1.status).toBe(201);

      const res2 = await fetch('http://localhost:3000/api/v1/users/MesmoCase');

      expect(res2.status).toBe(200);

      const res2Body = await res2.json();

      expect(res2Body).toEqual({
        id: res2Body.id,
        username: 'MesmoCase',
        email: 'mesmo.case@gustavogonz.com.br',
        password: 'senha123',
        created_at: res2Body.created_at,
        updated_at: res2Body.updated_at,
      });

      expect(uuidVersion(res2Body.id)).toBe(4);
      expect(Date.parse(res2Body.created_at)).not.toBeNaN();
      expect(Date.parse(res2Body.updated_at)).not.toBeNaN();
    });

    test('With case mismatch', async () => {
      const res1 = await fetch('http://localhost:3000/api/v1/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'CaseDiferente',
          email: 'case.diferente@gustavogonz.com.br',
          password: 'senha123',
        }),
      });

      expect(res1.status).toBe(201);

      const res2 = await fetch(
        'http://localhost:3000/api/v1/users/casediferente',
      );

      expect(res2.status).toBe(200);

      const res2Body = await res2.json();

      expect(res2Body).toEqual({
        id: res2Body.id,
        username: 'CaseDiferente',
        email: 'case.diferente@gustavogonz.com.br',
        password: 'senha123',
        created_at: res2Body.created_at,
        updated_at: res2Body.updated_at,
      });

      expect(uuidVersion(res2Body.id)).toBe(4);
      expect(Date.parse(res2Body.created_at)).not.toBeNaN();
      expect(Date.parse(res2Body.updated_at)).not.toBeNaN();
    });

    test('With nonexistent username', async () => {
      const res = await fetch(
        'http://localhost:3000/api/v1/users/UsuarioInexistente',
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
  });
});
