import type { AIProvider, TriageInput, TriageOutput } from '@/types'
import { runDemoTriage } from './demo'
import { runOpenAITriage } from './openai'
import { runAnthropicTriage } from './anthropic'
import { runGeminiTriage } from './gemini'

export function getActiveProvider(): { provider: AIProvider; mode: 'real' | 'demo' } {
  if (process.env.ANTHROPIC_API_KEY) return { provider: 'anthropic', mode: 'real' }
  if (process.env.OPENAI_API_KEY) return { provider: 'openai', mode: 'real' }
  if (process.env.GEMINI_API_KEY) return { provider: 'gemini', mode: 'real' }
  return { provider: 'demo', mode: 'demo' }
}

export async function runTriage(input: TriageInput): Promise<TriageOutput> {
  const { provider } = getActiveProvider()

  switch (provider) {
    case 'openai':
      return runOpenAITriage(input, process.env.OPENAI_API_KEY!)
    case 'anthropic':
      return runAnthropicTriage(input, process.env.ANTHROPIC_API_KEY!)
    case 'gemini':
      return runGeminiTriage(input, process.env.GEMINI_API_KEY!)
    default:
      return runDemoTriage(input)
  }
}
