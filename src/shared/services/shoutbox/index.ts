import { desc, eq } from 'drizzle-orm'
import { blockquote, bold, code, format, InlineKeyboard } from 'gramio'
import { moderationCallbackData } from '@/bot/callback-query.js'
import { bot } from '@/bot/index.js'
import database from '@/shared/database/index.js'
import { shoutboxMessages } from '@/shared/database/schema.js'
import env from '@/shared/env.js'

export class ShoutboxService {
  static async getMessages(limit: number = 10, offset: number = 0) {
    const messages = await database
      .select()
      .from(shoutboxMessages)
      .where(eq(shoutboxMessages.status, 'approved'))
      .orderBy(desc(shoutboxMessages.createdAt))
      .limit(limit)
      .offset(offset)
      .then(rows => rows.map(row => ({
        id: row.id,
        content: row.content,
        reply: row.reply,
        createdAt: row.createdAt.toISOString(),
      })))

    const totalMessages = await database.$count(shoutboxMessages, eq(shoutboxMessages.status, 'approved'))
    const hasNextPage = offset + limit < totalMessages

    return {
      messages,
      hasNextPage,
    }
  }

  static async addMessage(content: string, ipAddress?: string) {
    const [message] = await database
      .insert(shoutboxMessages)
      .values({
        content,
      })
      .returning()

    setImmediate(() => {
      bot.api.sendMessage({
        chat_id: env.bot.chatId,
        text: format`
          ${bold('New shoutbox message')}
          ${bold('Sender:')} ${code(ipAddress ?? 'unknown')}

          ${bold('Content:')}
          ${blockquote(content)}

          #id${message.id}
        `,
        reply_markup: new InlineKeyboard()
          .text('approve', moderationCallbackData.pack({ id: message.id, action: 'approve' }))
          .text('reject', moderationCallbackData.pack({ id: message.id, action: 'reject' })),
      })
    })

    return message
  }

  static async moderateMessage(id: number, action: 'approve' | 'reject', reply?: string) {
    return database
      .update(shoutboxMessages)
      .set({
        status: action === 'approve' ? 'approved' : 'rejected',
        reply,
      })
      .where(eq(shoutboxMessages.id, id))
      .returning()
  }
}
