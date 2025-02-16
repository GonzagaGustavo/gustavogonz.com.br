import { NextApiRequest, NextApiResponse } from 'next';
import migrationRunner, { RunnerOption } from 'node-pg-migrate';
import { resolve } from 'node:path';
import { createRouter } from 'next-connect';
import { Client } from 'pg';

import database from '~/infra/database';
import controller from '~/infra/controller';

const router = createRouter<NextApiRequest, NextApiResponse>();

router.get(getHandler);
router.post(postHandler);

export default router.handler(controller.errorHandlers);

const defaultMigrationOptions: Omit<RunnerOption, 'dbClient'> = {
  dryRun: true,
  dir: resolve('src', 'infra', 'migrations'),
  direction: 'up',
  verbose: true,
  migrationsTable: 'pgmigrations',
};

async function getHandler(req: NextApiRequest, res: NextApiResponse) {
  let dbClient: Client | undefined;

  try {
    dbClient = await database.getNewClient();

    const pendingMigrations = await migrationRunner({
      ...defaultMigrationOptions,
      dbClient,
    });

    res.status(200).json(pendingMigrations);
  } finally {
    await dbClient?.end();
  }
}

async function postHandler(req: NextApiRequest, res: NextApiResponse) {
  let dbClient: Client | undefined;

  try {
    dbClient = await database.getNewClient();

    const migratedMigrations = await migrationRunner({
      ...defaultMigrationOptions,
      dbClient,
      dryRun: false,
    });

    if (migratedMigrations.length > 0) {
      res.status(201).json(migratedMigrations);
    }
    res.status(200).json(migratedMigrations);
  } finally {
    await dbClient?.end();
  }
}
