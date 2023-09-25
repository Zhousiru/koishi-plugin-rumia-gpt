import { Context, Schema, h } from 'koishi'
import { useGpt } from './gpt'

export const name = 'rumia-gpt'

export interface Config {
  activeId: string[]
  systemPrompt: string
  contextTimeout: number
  contextSize: number
  openAiKey: string[]
  keyLimit: number
}

export const Config: Schema<Config> = Schema.object({
  activeId: Schema.array(String).description('Where you want to enable Rumia GPT.'),
  systemPrompt: Schema.string()
    .role('textarea', { rows: [4] })
    .description('`{DATE}` stands for current date.'),
  contextTimeout: Schema.number()
    .default(12 * 60 * 60 * 1000)
    .description('Context timeout (ms).<br>The timed-out context will be reset.'),
  contextSize: Schema.number()
    .default(8)
    .description(
      'Context maximum size (excluding system prompt).<br>Oldest record will be remove.'
    ),
  openAiKey: Schema.array(String).description('OpenAI API Key pool.'),
  keyLimit: Schema.number()
    .default(3)
    .description('Maximum number of times each key can be used per minute.'),
})

export let currentConfig: Config | null = null

export function apply(ctx: Context, config: Config) {
  ctx.on('ready', () => {
    currentConfig = config
  })

  ctx.on('message', async (session) => {
    if (!currentConfig.activeId.includes(session.channelId)) {
      return
    }

    let processFlag = false
    for (const el of session.elements) {
      if (el.type === 'at' && el.attrs.id === session.bot.selfId) {
        processFlag = true
        break
      }
    }
    if (!processFlag) {
      return
    }

    const ask = useGpt(session)

    try {
      const response = await ask(session.content)
      session.send(
        `${h('quote', {
          id: session.messageId,
        })}${response}`
      )
    } catch (error) {
      session.send(`Cannot get response from OpenAI.\n${error}`)
    }
  })
}
