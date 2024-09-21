import { Client } from 'pg';

export const query = async (queryObject: any) => {
  const client = new Client({
    host: process.env.POSTGRES_HOST,
    port: Number(process.env.POSTGRES_PORT),
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
  });

  try {
    await client.connect();

    return client.query(queryObject);
  } catch (err) {
    console.error(err);
    throw err;
  } finally {
    await client.end();
  }
};
