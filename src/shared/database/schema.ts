import { integer, pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

export const shoutboxModerationStatus = pgEnum('shoutbox_moderation_status', ['pending', 'approved', 'rejected'])

export const shoutboxMessages = pgTable('shoutbox_messages', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  status: shoutboxModerationStatus('status').notNull().default('pending'),
  content: text('content').notNull(),
  reply: text('reply'),

  createdAt: timestamp('created_at').notNull().defaultNow(),
})
