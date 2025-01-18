import { and, Column, eq, SQL } from 'drizzle-orm';
import { IndexColumn, PgInsertValue, PgTable } from 'drizzle-orm/pg-core';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { SelectResultField } from 'drizzle-orm/query-builders/select.types';

type ReturnType<InsertSchema> = SelectResultField<
  InsertSchema & { id: number; version?: number }
>;

export const upsert = async <
  TTable extends PgTable,
  InsertSchema extends PgInsertValue<TTable>,
  IdColumn extends IndexColumn,
  VersionColumn extends Column,
>(
  entity: InsertSchema,
  toUpdate: Partial<InsertSchema> & Record<string, unknown>,
  options: {
    id: [IdColumn, string | number | null];
    version?: [VersionColumn, number];
  },
  db: NodePgDatabase<Record<string, unknown>>,
): Promise<ReturnType<InsertSchema>> => {
  const [idColumn, id] = options.id;
  const [versionColumn, version] = options.version ?? [];

  let set = toUpdate;
  let whereId: SQL<unknown> | undefined = id ? eq(idColumn, id) : undefined;
  let whereVersion: SQL<unknown> | undefined;

  const onConflictParams: {
    target: IdColumn;
    set: Partial<InsertSchema> & Record<string, unknown>;
    where?: SQL<unknown>;
  } = {
    target: idColumn,
    set,
  };

  if (whereId) {
    onConflictParams.where = whereId;
  }

  if (versionColumn) {
    whereVersion = eq(versionColumn, version);
    set = { ...set, [versionColumn.name]: version ? version + 1 : 1 };
    onConflictParams.set = { ...set, version: version ? version + 1 : 1 };
  }

  if (whereId && whereVersion) {
    onConflictParams.where = and(whereId, whereVersion);
  }

  const result = await db
    .insert(idColumn.table)
    .values(id ? entity : set)
    .onConflictDoUpdate(onConflictParams)
    .returning();

  if (result.length !== 0) {
    return result[0] as ReturnType<InsertSchema>;
  }

  const updatedResult = await db.select().from(idColumn.table).where(whereId);

  if (updatedResult.length === 0) {
    throw Error(
      `Invalid version '${options.version?.[1] ?? ''} for record with id '${id?.toString()}`,
    );
  }

  return updatedResult[0] as ReturnType<InsertSchema>;
};
