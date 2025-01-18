import 'dotenv/config';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { DrizzleConfig } from 'drizzle-orm';

const pools: Map<string, Pool> = new Map();

export const getPool = (connectionString: string) => {
  const pool = pools.get(connectionString);
  if (!pool) {
    pools.set(connectionString, new Pool({ connectionString }));
  }
  return pools.get(connectionString) as Pool;
};

export const endPool = async (connectionString: string): Promise<void> => {
  const pool = pools.get(connectionString);
  if (pool) {
    await pool.end();
    pools.delete(connectionString);
  }
};

export const getDB = <
  TSchema extends Record<string, unknown> = Record<string, never>,
>(
  connectionString: string,
  config: DrizzleConfig<TSchema>,
): NodePgDatabase<TSchema> => {
  return drizzle(getPool(connectionString), config);
};

export { upsert } from './upsert';
