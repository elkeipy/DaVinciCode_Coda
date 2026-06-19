import { integer, jsonb, pgTable, primaryKey, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  loginId: text('login_id').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  displayName: text('display_name').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const rooms = pgTable('rooms', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  hostUserId: uuid('host_user_id')
    .notNull()
    .references(() => users.id),
  status: text('status').notNull(),
  maxPlayers: integer('max_players').notNull().default(4),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const roomMembers = pgTable(
  'room_members',
  {
    roomId: uuid('room_id')
      .notNull()
      .references(() => rooms.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    joinedAt: timestamp('joined_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [primaryKey({ columns: [table.roomId, table.userId] })],
);

export const games = pgTable('games', {
  id: uuid('id').primaryKey().defaultRandom(),
  roomId: uuid('room_id')
    .notNull()
    .unique()
    .references(() => rooms.id, { onDelete: 'cascade' }),
  stateJson: jsonb('state_json').notNull(),
  phase: text('phase').notNull(),
  schemaVersion: integer('schema_version').notNull().default(1),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
