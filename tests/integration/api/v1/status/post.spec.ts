import { beforeAll, describe, expect, test } from '@jest/globals';
import orchestrator from '~/../tests/orchestrator';

beforeAll(async () => {
  await orchestrator.waitForAllServices();
});

describe('POST /api/v1/status', () => {
  describe('Anonymous user', () => {
    test('Retrieving current system status', async () => {
      const res = await fetch('http://localhost:3000/api/v1/status', {
        method: 'POST',
      });
      expect(res.status).toBe(405);

      const responseBody = await res.json();

      expect(responseBody).toEqual({
        name: 'MethodNotAllowedError',
        message: 'Method not allowed for this endpoint.',
        action: 'Check if the http method is valid for this endpoint.',
        status_code: 405,
      });
    });
  });
});
