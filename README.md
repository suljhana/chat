# MCP (Model Context Protocol)

This repository contains examples of using Pipedream's dynamic MCP server.

## What Makes Pipedream's MCP Server Unique

Unlike traditional MCP implementations that provide a fixed set of tools, Pipedream's MCP server offers dynamic tools. This means that the tools are not pre-defined, but are discovered and configured on-demand.

This is something that the spec defines, but the clients don't support it yet.

This repo contains examples of how you, as the developer of an MCP client, can use Pipedream's MCP server.

## High level

The idea is to manually reload the list of tools on each turn.

## Examples

This repository includes two examples showing different approaches to integrating with Pipedream's dynamic MCP server:

- **[AI SDK Example](examples/ai-sdk/)** - Uses Vercel's AI SDK with automatic tool handling
- **[OpenAI SDK Example](examples/openai-sdk/)** - Uses OpenAI SDK directly with manual tool conversion for full control

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

#### OpenAI SDK Example

```bash
pnpm openai-sdk -u <external-user-id> "<prompt>"
```

For example:

```bash
pnpm ai-sdk -u <uuid> "Send a funny joke to the #random channel in Slack"
pnpm openai-sdk -u <uuid> "Send a funny joke to the #random channel in Slack"
```
