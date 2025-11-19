import { Bot } from 'gramio'
import env from '@/shared/env.js'
import { ShoutboxService } from '@/shared/services/shoutbox/index.js'
import { moderationCallbackData } from './callback-query.js'

export const bot = new Bot(env.bot.token)
export type BotType = typeof bot

bot.on('message', async (ctx) => {
  if (!ctx.hasReplyMessage() || ctx.chatId !== env.bot.chatId)
    return

  const idHashtag = Number.parseInt(ctx.replyMessage?.text?.match(/#id(\d+)/)?.[1] ?? '0')
  if (!idHashtag)
    return

  await ShoutboxService.moderateMessage(idHashtag, 'approve' as 'approve' | 'reject', ctx.text)

  return ctx.reply('Message approved')
})

bot.callbackQuery(moderationCallbackData, async (ctx) => {
  const { id, action } = ctx.queryData

  await ShoutboxService.moderateMessage(id, action as 'approve' | 'reject')

  return ctx.editText(`${ctx.message?.text ?? ''}\n\n${action === 'approve' ? 'Approved' : 'Rejected'}`, {
    entities: ctx.message?.entities?.map(entity => entity.payload) ?? [],
  })
})
