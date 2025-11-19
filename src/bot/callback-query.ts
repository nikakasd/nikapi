import { CallbackData } from 'gramio'

export const moderationCallbackData = new CallbackData('moderation')
  .number('id')
  .string('action')
