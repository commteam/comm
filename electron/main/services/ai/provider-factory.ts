import type { AIProvider } from '../../../../src/shared/types'
import type { AIProviderType } from '../../../../src/shared/types/settings'
import { LocalAIProvider } from './local-provider'

let currentProvider: AIProvider | null = null

export function getAIProvider(): AIProvider {
  if (!currentProvider) {
    currentProvider = createProvider('local')
  }
  return currentProvider
}

export function createProvider(type: AIProviderType): AIProvider {
  switch (type) {
    case 'local':
      return new LocalAIProvider()

    case 'openai':
    case 'claude':
    case 'gemini':
    case 'ollama':
    case 'lmstudio':
      // Future providers — placeholder until implemented
      console.warn(`Provider "${type}" not yet implemented. Falling back to local.`)
      return new LocalAIProvider()

    default:
      return new LocalAIProvider()
  }
}

export function setAIProvider(provider: AIProvider): void {
  currentProvider = provider
}
