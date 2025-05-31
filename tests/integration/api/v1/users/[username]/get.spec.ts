import user from '~/models/user';
import password from '~/models/password';

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
      await orchestrator.createUser({
        username: 'MesmoCase',
        email: 'mesmo.case@gustavogonz.com.br',
        password: 'senha123',
      });

      const res = await fetch('http://localhost:3000/api/v1/users/MesmoCase');

      expect(res.status).toBe(200);

      const resBody = await res.json();

      expect(resBody).toEqual({
        id: resBody.id,
        username: 'MesmoCase',
        email: 'mesmo.case@gustavogonz.com.br',
        password: resBody.password,
        created_at: resBody.created_at,
        updated_at: resBody.updated_at,
      });

      expect(uuidVersion(resBody.id)).toBe(4);
      expect(Date.parse(resBody.created_at)).not.toBeNaN();
      expect(Date.parse(resBody.updated_at)).not.toBeNaN();

      const userInDatabase = await user.findOneByUsername('MesmoCase');
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

    test('With case mismatch', async () => {
      await orchestrator.createUser({
        username: 'CaseDiferente',
        email: 'case.diferente@gustavogonz.com.br',
        password: 'senha123',
      });

      const res = await fetch(
        'http://localhost:3000/api/v1/users/casediferente',
      );

      expect(res.status).toBe(200);

      const resBody = await res.json();

      expect(resBody).toEqual({
        id: resBody.id,
        username: 'CaseDiferente',
        email: 'case.diferente@gustavogonz.com.br',
        password: resBody.password,
        created_at: resBody.created_at,
        updated_at: resBody.updated_at,
      });

      expect(uuidVersion(resBody.id)).toBe(4);
      expect(Date.parse(resBody.created_at)).not.toBeNaN();
      expect(Date.parse(resBody.updated_at)).not.toBeNaN();
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
