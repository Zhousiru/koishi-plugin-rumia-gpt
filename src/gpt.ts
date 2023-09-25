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

const reservedCount = 2
const contextMap: Map<string, Array<ContextRecord>> = new Map()

function initContext(session: Session<never, never>): Array<ContextRecord> {
  const context: Array<ContextRecord> = []
  contextMap.set(session.userId, context)

  context.push({
    data: systemPrompt,
    addTime: new Date(),
  })

  const { nickname, name } = session.author
  let username = ''
  if (nickname) {
    username = nickname
  } else {
    username = name
  }

  context.push({
    data: {
      role: 'system',
      content: `User's name is ${username}.`,
    },
    addTime: new Date(),
  })

  return context
}

function pushContextRecord(context: Array<ContextRecord>, data: ContextData) {
  if (context.length - reservedCount >= currentConfig.contextSize) {
    context.splice(reservedCount, 1)
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
    dayjs().format('YYYY-MM-DD HH:mm:ss')
  )

  let context: Array<ContextRecord> = []
  if (!contextMap.has(session.userId)) {
    context = initContext(session)
  } else {
    context = contextMap.get(session.userId)
  }

  const ask = async (message: string): Promise<string> => {
    const last = context[context.length - 1]
    if (new Date().getTime() - last.addTime.getTime() > currentConfig.contextTimeout * 60 * 1000) {
      // Context is outdated.
      context = initContext(session)
    }

    const apiKey = getKey()

    const openai = new OpenAI({ apiKey, timeout: 10 * 1000 })

    pushContextRecord(context, {
      role: 'user',
      content: message,
    })

    const completion = await openai.chat.completions.create({
      messages: context.map((record) => record.data),
      model: currentConfig.gptModel,
      temperature: currentConfig.gptTemperature,
      top_p: currentConfig.gptTopP,
      max_tokens: currentConfig.gptMaxTokens,
      presence_penalty: currentConfig.gptPresencePenalty,
      frequency_penalty: currentConfig.gptFrequencyPenalty,
    })

    let content = completion.choices[0].message.content

    // Filter the response content.
    for (const [key, value] of Object.entries(currentConfig.filter)) {
      content = content.replaceAll(key, value)
    }

    pushContextRecord(context, {
      role: 'assistant',
      content,
    })

    return content
  }

  return ask
}

export function clearContext(session: Session<never, never>) {
  contextMap.delete(session.userId)
}

export function getContext(session: Session<never, never>): string {
  if (!contextMap.has(session.userId)) {
    return 'No context for you.'
  }

  return contextMap
    .get(session.userId)
    .slice(reservedCount)
    .map((record) => `${record.data.role}:\n${record.data.content}`)
    .join('\n\n')
}
