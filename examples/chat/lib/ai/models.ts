export const DEFAULT_CHAT_MODEL: string = "claude-3.7-sonnet"

interface ChatModel {
  id: string
  name: string
  description: string
}

export const chatModels: Array<ChatModel> = [
  {
    id: "gpt-4o-mini",
    name: "OpenAI: GPT-4o Mini",
    description: "Small model for fast, lightweight tasks",
  },
  {
    id: "gpt-4.1",
    name: "OpenAI: GPT-4.1",
    description: "Flagship model for complex tasks",
  },
  {
    id: "claude-opus-4",
    name: "Anthropic: Claude Opus 4",
    description: "Highest level of intelligence and capability",
  },
  {
    id: "claude-sonnet-4",
    name: "Anthropic: Claude Sonnet 4",
    description: "High intelligence and balanced performance",
  },
  // {
  //   id: 'chat-model-reasoning',
  //   name: 'Reasoning model',
  //   description: 'Uses advanced reasoning',
  // },
]
