import { Client, QueryConfig } from 'pg';
import { ServiceError } from './errors';

const query = async (queryObject: QueryConfig | string) => {
  let client;

  try {
    client = await getNewClient();

    return await client.query(queryObject);
  } catch (err) {
    const serviceErrorObject = new ServiceError({
      cause: err,
      message: 'Error connecting to the database or query.',
    });
    throw serviceErrorObject;
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
    ssl: getSSLValues(),
    connectionTimeoutMillis: 7 * 1000,
  });

  await client.connect();

  return client;
}

const database = { query, getNewClient };
export default database;

function getSSLValues() {
  if (process.env.POSTGRES_CA) {
    return { ca: process.env.POSTGRES_CA };
  }

  return process.env.NODE_ENV === 'production' ? true : false;
}
