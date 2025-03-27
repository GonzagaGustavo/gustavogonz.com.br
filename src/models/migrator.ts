import migrationRunner, { RunnerOption } from 'node-pg-migrate';
import { resolve } from 'node:path';
import { Client } from 'pg';

import database from '~/infra/database';
import { ServiceError } from '~/infra/errors';

const defaultMigrationOptions: Omit<RunnerOption, 'dbClient'> = {
  dryRun: true,
  dir: resolve('src', 'infra', 'migrations'),
  direction: 'up',
  log: () => {},
  migrationsTable: 'pgmigrations',
};

async function listPendingMigrations() {
  let dbClient: Client | undefined;

  try {
    dbClient = await database.getNewClient();

    const pendingMigrations = await migrationRunner({
      ...defaultMigrationOptions,
      dbClient,
    });

    return pendingMigrations;
  } finally {
    await dbClient?.end();
  }
}

async function runPendingMigrations() {
  let dbClient: Client | undefined;

  try {
    dbClient = await database.getNewClient();

    const migratedMigrations = await migrationRunner({
      ...defaultMigrationOptions,
      dbClient,
      dryRun: false,
    });

    return migratedMigrations;
  } catch (err) {
    const serviceErrorObject = new ServiceError({
      cause: err,
      message: 'Error runing migrations.',
    });
    throw serviceErrorObject;
  } finally {
    await dbClient?.end();
  }
}

const migrator = {
  listPendingMigrations,
  runPendingMigrations,
};

export default migrator;
