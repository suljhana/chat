# MCP (Model Context Protocol)

This repository contains examples of using Pipedream's MCP server.

### Installation

Install dependencies:

```bash
pnpm install
```

### Prerequisites

To set up your environment, you'll need:

1. A [Pipedream account](https://pipedream.com/auth/signup)
2. A [Pipedream project](/projects/#creating-projects). Accounts connected via MCP will be stored here.
3. [Pipedream OAuth credentials](/rest-api/auth/#oauth)
4. An [OpenAI API key](https://platform.openai.com/api-keys)

### Set up your environment

Copy the example environment file and add your credentials:

```bash
cp .env.example .env
```

Learn more about [environments in Pipedream Connect](/connect/managed-auth/environments).

### Running Examples

You can run the examples using the following commands from the root directory:

#### Vercel AI SDK Example

```bash
pnpm ai-sdk -u <external-user-id> "<prompt>"
```

For example,

```bash
pnpm ai-sdk -u abc-123 "Send a funny joke to the #random channel in Slack"
```
