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
  gptModel: string
  gptTemperature: number
  gptTopP: number
  gptMaxTokens: number
  gptPresencePenalty: number
  gptFrequencyPenalty: number
}

export const Config: Schema<Config> = Schema.object({
  activeId: Schema.array(String).description('Where you want to enable Rumia GPT.'),
  systemPrompt: Schema.string()
    .role('textarea', { rows: [4] })
    .description('`{DATE}` stands for current date.'),
  contextTimeout: Schema.number()
    .default(10)
    .description('Context timeout (min).<br>The timed-out context will be reset.'),
  contextSize: Schema.number()
    .default(8)
    .description(
      'Context maximum size (excluding system prompt).<br>Oldest record will be remove.'
    ),
  openAiKey: Schema.array(String).description('OpenAI API Key pool.'),
  keyLimit: Schema.number()
    .default(3)
    .description('Maximum number of times each key can be used per minute.'),
  gptModel: Schema.string().default('gpt-3.5-turbo-0613').description('ChatGPT model name.'),
  gptTemperature: Schema.number()
    .role('slider')
    .min(0)
    .max(2)
    .step(0.1)
    .default(0.2)
    .description(
      'What sampling temperature to use, between 0 and 2.<br>Higher values like 0.8 will make the output more random, while lower values like 0.2 will make it more focused and deterministic.<br>We generally recommend altering this or `top_p` but not both.'
    ),
  gptTopP: Schema.number()
    .role('slider')
    .min(0)
    .max(1)
    .step(0.1)
    .default(1)
    .description(
      'An alternative to sampling with temperature, called nucleus sampling, where the model considers the results of the tokens with top_p probability mass.<br>So 0.1 means only the tokens comprising the top 10% probability mass are considered.<br>We generally recommend altering this or `temperature` but not both.'
    ),
  gptMaxTokens: Schema.number()
    .default(200)
    .description('The maximum number of tokens to generate in the chat completion.'),
  gptPresencePenalty: Schema.number()
    .role('slider')
    .min(-2)
    .max(2)
    .step(0.1)
    .default(-1.6)
    .description(
      "Number between -2.0 and 2.0.<br>Positive values penalize new tokens based on whether they appear in the text so far, increasing the model's likelihood to talk about new topics."
    ),
  gptFrequencyPenalty: Schema.number()
    .role('slider')
    .min(-2)
    .max(2)
    .step(0.1)
    .default(0)
    .description(
      "Number between -2.0 and 2.0.<br>Positive values penalize new tokens based on their existing frequency in the text so far, decreasing the model's likelihood to repeat the same line verbatim."
    ),
})

export let currentConfig: Config | null = null
export let currentCtx: Context | null = null

export function apply(ctx: Context, config: Config) {
  ctx.on('ready', () => {
    currentConfig = config
    currentCtx = ctx
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
      session.send(
        `${h('quote', {
          id: session.messageId,
        })}Cannot get response from OpenAI.\n${error}`
      )
    }
  })
}
