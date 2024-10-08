import { Client } from 'pg';

const query = async (queryObject: any) => {
  let client;

  try {
    client = await getNewClient();

    return await client.query(queryObject);
  } catch (err) {
    console.error(err);
    throw err;
  } finally {
    await client?.end();
  }
};

async function getNewClient() {
  const client = new Client({
    host: process.env.POSTGRES_HOST,
    port: Number(process.env.POSTGRES_PORT),
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
  });

  await client.connect();

  return client;
}

const database = { query, getNewClient };
export default database;
