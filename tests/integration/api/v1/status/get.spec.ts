import { describe, expect, test } from '@jest/globals';

describe('status tests', () => {
  test('should return status code 200', async () => {
    const res = await fetch('http://localhost:3000/api/v1/status');
    expect(res.status).toBe(200);

    const responseBody = await res.json();

    const parsedUpdatedAt = new Date(responseBody.updated_at).toISOString();
    expect(responseBody.updated_at).toEqual(parsedUpdatedAt);

    expect(responseBody.dependencies.database.version).toEqual('16.4');
    expect(responseBody.dependencies.database.max_connections).toEqual(100);
    expect(responseBody.dependencies.database.opened_connections).toEqual(1);
  });
});