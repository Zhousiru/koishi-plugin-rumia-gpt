import { currentConfig } from '.'

const keyPool = []

export function getKey(): string {
  return currentConfig.openAiKey[0]
}
