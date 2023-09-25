import { currentConfig } from '.'

const keyMap: Map<string, number[]> = new Map()

export function getKey(): string {
  const visited = new Set<number>()
  while (visited.size < currentConfig.openAiKey.length) {
    let selectedIndex = 0
    do {
      selectedIndex = Math.floor(Math.random() * currentConfig.openAiKey.length)
    } while (visited.has(selectedIndex))

    visited.add(selectedIndex)
    const key = currentConfig.openAiKey[selectedIndex]

    if (!keyMap.has(key)) {
      const status = [new Date().getTime()]
      keyMap.set(key, status)
      return key
    }

    const status = keyMap.get(key)

    let trimIndex = -1
    let now = new Date().getTime()

    for (let index = status.length - 1; index >= 0; index--) {
      const time = status[index]

      if (now - time > 60 * 1000) {
        trimIndex = index
        break
      }
    }

    status.splice(0, trimIndex + 1)

    if (status.length >= currentConfig.keyLimit) {
      continue
    } else {
      status.push(now)
      return key
    }
  }

  throw 'All OpenAI API keys are fully loaded. Please wait a few seconds.'
}
