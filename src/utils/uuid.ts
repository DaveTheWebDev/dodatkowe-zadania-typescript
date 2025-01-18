import { randomUUID } from 'crypto';
import type { Brand } from './brand';

export type UUID = Brand<string, 'UUID'>;

export const UUID = {
  randomUUID: (): UUID => randomUUID() as UUID,
  from: (uuid: string) => uuid as UUID,
};
