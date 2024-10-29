import { beforeAll, describe, expect, test } from '@jest/globals';
import database from '~/infra/database';
import orchestrator from '../../../../orchestrator';

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await database.query('drop schema public cascade; create schema public;');
});

describe('GET /api/v1/migrations', () => {
  describe('Anonymous user', () => {
    test('Retrieving pending migrations', async () => {
      const res = await fetch('http://localhost:3000/api/v1/migrations');

      expect(res.status).toBe(200);

      const resBody = await res.json();
      expect(resBody.length).toBeGreaterThan(0);
    });
  });
});
