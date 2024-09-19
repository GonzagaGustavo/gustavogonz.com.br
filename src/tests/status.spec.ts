import { describe, expect, test } from '@jest/globals';

describe('status tests', () => {
  test('should return status code 200', async () => {
    const res = await fetch('http://localhost:3000/api/v1/status');
    expect(res.status).toBe(200);
  });
});
