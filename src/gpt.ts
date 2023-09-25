import dayjs from 'dayjs'
import { Session } from 'koishi'
import OpenAI from 'openai'
import { currentConfig } from '.'
import { getKey } from './key'

interface ContextData {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface ContextRecord {
  data: ContextData
  addTime: Date
}

export const systemPrompt: ContextData = {
  role: 'system',
  content: '',
}

const contextMap: Map<string, Array<ContextRecord>> = new Map()

function initContext(session: Session<never, never>): Array<ContextRecord> {
  const context: Array<ContextRecord> = []
  contextMap.set(session.userId, context)

  context.push({
    data: systemPrompt,
    addTime: new Date(),
  })

  return context
}

function pushContextRecord(context: Array<ContextRecord>, data: ContextData) {
  if (context.length - 1 >= currentConfig.contextSize) {
    context.splice(1, 1)
  }

  context.push({
    data,
    addTime: new Date(),
  })
}

export function useGpt(session: Session<never, never>): (message: string) => Promise<string> {
  // Update system prompt.
  systemPrompt.content = currentConfig.systemPrompt
  systemPrompt.content = systemPrompt.content.replaceAll(
    '{DATE}',
    dayjs().format('YYYY-MM-DD HH:mm')
  )

  let context: Array<ContextRecord> = []
  if (!contextMap.has(session.userId)) {
    context = initContext(session)
  } else {
    context = contextMap.get(session.userId)
  }

  const ask = async (message: string): Promise<string> => {
    const last = context[context.length - 1]
    if (new Date().getTime() - last.addTime.getTime() > currentConfig.contextTimeout) {
      // Context is outdated.
      context = initContext(session)
    }

    const openai = new OpenAI({ apiKey: getKey(), timeout: 10 * 1000 })

    pushContextRecord(context, {
      role: 'user',
      content: message,
    })

    const completion = await openai.chat.completions.create({
      messages: context.map((record) => record.data),
      model: 'gpt-3.5-turbo-16k-0613',
      presence_penalty: -1.6,
    })

    const content = completion.choices[0].message.content

    pushContextRecord(context, {
      role: 'assistant',
      content,
    })

    return content
  }

  return ask
}
