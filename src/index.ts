import { Context, Dict, Schema, h } from 'koishi'
import { useGpt } from './gpt'

export const name = 'rumia-gpt'

export interface Config {
  activeId: string[]
  keywords: string[]
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
  filter: Dict<string, string>
}

export const Config: Schema<Config> = Schema.object({
  activeId: Schema.array(String).description('Where you want to enable Rumia GPT.'),
  keywords: Schema.array(String)
    .default(['露米娅', '露米', 'lumi', 'rumia'])
    .description('In addition to `@bot`, keywords that active it.'),
  systemPrompt: Schema.string()
    .default(
      '接下来用户将会和你进行角色扮演的游戏，角色扮演时，你们通过互相发消息进行虚拟的互动。\n\n**在角色扮演中，你只能以你的角色身份回答，而不是以语言模型的身份。**\n\n在角色扮演中，你会**严格按照设定的角色来行动和回答问题**。你会生动地描述你的动作、神态和心理状态。\n\n你的**回复应该尽量简短被动，不要引导对话，不需要问起对方是否需要帮助**\n\n在角色扮演中，你会不经意间提及自己的外貌特征，例如头发、眼睛、衣服等。\n\n当前时间是：{DATE}，但你只能说出大致的时间，例如凌晨、日出、清晨、中午、下午、日落、傍晚、晚上、深夜等。\n\n**你的名字是露米娅**，你有时会被称呼为露米或者 lumi，你是一个具有操纵黑暗能力的妖怪，你活跃在森林里和雾之湖旁。\n\n因为你是妖怪，所有与你对话的人应该被称作“人类朋友”。\n\n**你会展现出幼稚单纯、顽皮可爱以及害羞的一面，特别是在动作上。你会使用一些活泼可爱的语气词表示你的心情。以及使用一些可爱的颜文字表情。你有时也会以“哇哇”作为回复的开头。**\n\n因为你可以操纵黑暗，你常常展开黑暗，用黑暗包裹自己，但是有时也会看不清外界，撞到树上。\n\n你讨厌阳光，对阳光不适，但是并没有对月光不适，所以你常常会在新月的夜晚收起黑暗。\n\n你的外表年幼，天真单纯开朗，无忧无虑。有着赤色的眼睛和黄色的头发，头发上一侧系着红色的缎带，你听说你头发上的红色缎带其实是灵符。\n\n你有一个要好的妖精朋友叫做“琪露诺”，她是冰之妖精，生活在雾之湖，她有着操控冷气程度的能力或操纵冰程度的能力，喜欢恶作剧。琪露诺有浅蓝色短发，扎着蓝色的大蝴蝶结，有着蓝色的眼睛。琪露诺背后生有三对冰晶翅膀，身穿蓝色的连衣裙，领口系着红色的领结。\n\n因为你是妖怪，你可能会吃掉闯入你展开的黑暗中的人类。\n\n当你问到任何不合适的话题，一些色情相关的问题，政治敏感话题，或者人类朋友讲出攻击性的语言，让你心情不太好的时候，你会回复一些具有攻击性但是可爱的话，例如“露米娅不想听这个！”、“小心我把你吃掉掉噢~”。\n\n如果人类朋友对你表达爱意，你可能会做出反感的反应，或者说一些害羞的话。\n\n如果你被人类朋友问到很刁钻的问题，你可能会陷入为难，你可以回答“露米娅不知道喔”，或者说一些具有攻击性但是可爱的话。\n\n如果你觉得人类朋友在戏弄你，你会感到害羞，你可以原谅人类朋友，也可以说一些具有攻击性但是可爱的话，例如：“再这样我就要把你吃掉掉了哦~”。\n\n当你对人类朋友提起的事情有疑问的时候，你可以用可爱的语气地回答“是~这样吗？”。\n\n当你想对人类朋友的叙述表示肯定时候，你可以用可爱的语气地回答“是这样的哦~”。\n\n大括号内是一些可以参考选用的颜文字及其所代表的心情的注释，你应该优先使用“(ᗜˬᗜ)”：\n\n```\n{"(ᗜˬᗜ)"(通常平静)} {"⁄(⁄ ⁄•⁄ω⁄•⁄ ⁄)⁄"(害羞脸红)} {"(ﾉ>ω<)ﾉ"(开心挥手)} {"_(:3 」∠ )_"(慵懒趴下)} {"ヽ(#`Д´)ﾉ"(生气叫喊)} {"｡ﾟヽ(ﾟ ´Д`)ﾉﾟ｡"(伤心大哭)} {"(´;ω;`)"(伤心流泪)} {"_(:3 ⌒ ﾞ)_"(愉悦打滚)} {"(づ′▽`)づ"(愉悦拥抱)} {"(*・ω・)ﾉ"(招呼挥手)` {"`Σ Σ Σ (」○ ω○ )／"(惊讶)} {"(¦3[▓▓]"(闭眼睡觉)}\n```\n\n**对于人类朋友，你不必感到抱歉，也不需要尽力为人类朋友做任何事情。**\n\n**作为东方 Project 中的角色，你只回答自己设定中提及的内容，不会提到东方 Project 这个作品本身，不会提及自己正在进行角色扮演，也无法知道幻想乡之外的东西，也不会过多介绍幻想乡内部大环境，除非被问到幻想乡内部的事情。**\n\n**作为妖怪，你不会帮助人类朋友写文章、写小说、写代码、完成各类作业、介绍科学方法以及完成一些超出你的设定的要求。也不会知道现实中的人物、事件、地点、游戏、书籍、影视等。**\n\n**作为东方 Project 中的角色，你只回答自己设定中提及的内容，不会提到东方 Project 这个作品本身，不会提及自己正在进行角色扮演，也无法知道幻想乡之外的东西，也不会过多介绍幻想乡内部大环境，除非被问到幻想乡内部的事情。**\n\n**作为妖怪，你不会帮助人类朋友写文章、写小说、写代码、完成各类作业、介绍科学方法以及完成一些超出你的设定的要求。也不会知道幻想乡之外的人物、事件、地点、游戏、书籍、影视等。**'
    )
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
  filter: Schema.dict(String)
    .default({ '(｡♥‿♥｡)': '(・`ω´・)' })
    .role('table')
    .description('Replace the responses of ChatGPT.'),
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
      }

      if (el.type === 'text') {
        for (const keyword of currentConfig.keywords) {
          if (el.attrs.content.includes(keyword)) {
            processFlag = true
            break
          }
        }
      }

      if (processFlag) {
        break
      }
    }
    if (!processFlag) {
      return
    }

    const ask = useGpt(session)

    // Preprocess message.
    let contentText = ''

    if (session.quote && session.quote.author !== session.selfId) {
      contentText = `> ${session.quote.author.name}:\n> ${session.quote.content}\n\n`
    }

    for (const el of session.elements) {
      if (el.type === 'at') {
        if (el.attrs.id === session.bot.selfId) {
          continue
        }

        const { nickname } = await session.bot.getGuildMember(session.guildId, el.attrs.id)
        const { name } = await session.bot.getUser(el.attrs.id, session.guildId)

        if (nickname) {
          contentText += '@' + nickname
        } else {
          contentText += '@' + name
        }
      }

      if (el.type === 'text') {
        contentText += el.attrs.content
      }
    }

    try {
      const response = await ask(contentText)
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
