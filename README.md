# Pipedream MCP Examples

This repo contains examples to highlight how you can build an AI chat app using Pipedream's MCP server.

> Check out the chat app in production at: [chat.pipedream.com](https://chat.pipedream.com)

## What makes Pipedream's MCP server unique

Most traditional MCP implementations provide only a fixed set of tools. Pipedream's MCP server offers the ability to identify and load tools dynamically, which means tools can either be pre-defined or discovered and configured on-demand, based on the user's query.

This type of [tool discovery](https://modelcontextprotocol.io/docs/concepts/tools#tool-discovery-and-updates) is defined in the MCP spec, but most MCP clients don't support yet provide support for it.

This repo contains examples of how you, as the developer of an MCP client, can use Pipedream's app-level **or dynamic** MCP server by manually reloading the list of tools on each turn.

## Examples

This repo includes three examples showing different approaches to integrating with Pipedream's dynamic MCP server:

- The **[Chat App Example](examples/chat/)** is a full-featured web application demonstrating MCP integration in a real-world chat interface
- The **[AI SDK Example](examples/ai-sdk/)** uses Vercel's AI SDK with automatic tool handling
- The **[OpenAI SDK Example](examples/openai-sdk/)** uses OpenAI SDK directly with manual tool conversion for full control

### Installation

Install dependencies:

```bash
pnpm install
```

### Prerequisites

To set up your environment, you'll need:

1. A [Pipedream account](https://pipedream.com/auth/signup)
2. A [Pipedream project](https://pipedream.com/docs/projects/#creating-projects). Accounts connected via MCP will be stored here.
3. [Pipedream OAuth credentials](https://pipedream.com/docs/rest-api/auth/#oauth)
4. An [OpenAI API key](https://platform.openai.com/api-keys)

### Set up your environment

Copy the example environment file and add your credentials:

```bash
cp .env.example .env
```

Learn more about [environments in Pipedream Connect](https://pipedream.com/docs/connect/managed-auth/environments).

### Running the examples

You can run the examples using the following commands from the root directory:

#### Chat App Example

The chat app is a full-featured Next.js web application that demonstrates MCP integration in a production-ready environment:

```bash
pnpm chat
```

The chat app includes:

- **MCP integrations**: Connect to thousands of APIs through Pipedream's MCP server with built-in auth
- **Flexible LLM and framework support**: Works with any LLM provider or framework
- **Tool discovery**: Execute tool calls across different APIs via chat

For development, you can disable user sign-in and chat storage by setting these env vars:

```bash
# In .env
DISABLE_AUTH=true
DISABLE_PERSISTENCE=true
EXTERNAL_USER_ID=your-dev-user-id
```

#### Vercel AI SDK Example

```bash
pnpm ai-sdk -u <external-user-id> "<prompt>"
```

#### OpenAI SDK Example

```bash
pnpm openai-sdk -u <external-user-id> "<prompt>"
```

For example:

```bash
pnpm ai-sdk -u <uuid> "Send a funny joke to the #random channel in Slack"
pnpm openai-sdk -u <uuid> "Send a funny joke to the #random channel in Slack"
```
