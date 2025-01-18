import {
  PostgreSqlContainer,
  type StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import type { DrizzleConfig } from 'drizzle-orm';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { getDB, endPool } from '@storage';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

export interface TestConfiguration {
  start: <TSchema extends Record<string, unknown> = Record<string, never>>(
    config: DrizzleConfig<TSchema>,
  ) => Promise<NodePgDatabase<TSchema>>;
  stop: () => Promise<void>;
}

let postgreSQLContainer: StartedPostgreSqlContainer | null = null;
let startedCount = 0;

export const TestConfiguration = (): TestConfiguration => {
  let connectionString: string;

  return {
    start: async <
      TSchema extends Record<string, unknown> = Record<string, never>,
    >(
      config: DrizzleConfig<TSchema>,
    ): Promise<NodePgDatabase<TSchema>> => {
      if (startedCount++ === 0 || postgreSQLContainer === null)
        postgreSQLContainer = await new PostgreSqlContainer(
          'postgres:17-alpine',
        ).start();

      connectionString = postgreSQLContainer.getConnectionUri();

      const database = getDB<TSchema>(connectionString, config);

      await migrate(database, { migrationsFolder: './drizzle' });

      return database;
    },
    stop: async (): Promise<void> => {
      if (postgreSQLContainer !== null && --startedCount === 0) {
        try {
          await endPool(connectionString);
        } finally {
          await postgreSQLContainer.stop();
          postgreSQLContainer = null;
        }
      }
    },
  };
};
