import migrationRunner, { RunnerOption } from 'node-pg-migrate';
import { NextResponse } from 'next/server';
import { resolve } from 'node:path';
import database from '~/infra/database';
import { Client } from 'pg';

export async function GET() {
  const client = await database.getNewClient();

  const pendingMigrations = await migrationRunner(
    getMigrationConfigByMethod('GET', client),
  );

  await client.end();
  return NextResponse.json(pendingMigrations);
}

export async function POST() {
  const client = await database.getNewClient();

  const migratedMigrations = await migrationRunner(
    getMigrationConfigByMethod('POST', client),
  );

  await client.end();

  if (migratedMigrations.length > 0)
    return NextResponse.json(migratedMigrations, { status: 201 });
  return NextResponse.json(migratedMigrations);
}

function getMigrationConfigByMethod(
  method: 'POST' | 'GET',
  dbClient: Client,
): RunnerOption {
  const config: RunnerOption = {
    dbClient,
    dryRun: true,
    dir: resolve('src', 'infra', 'migrations'),
    direction: 'up',
    verbose: true,
    migrationsTable: 'pgmigrations',
  };
  if (method === 'POST') {
    return {
      ...config,
      dryRun: false,
    };
  }
  return config;
}
