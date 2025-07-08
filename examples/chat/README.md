## Pipedream MCP Chat

A reference implementation showcasing how to integrate Pipedream's MCP (Model Context Protocol) server into an AI chat application. This demo provides access to 10,000+ tools across 2,700+ APIs through a conversational interface.

Based on the [Next.js AI Chatbot](https://chat.vercel.ai/).

### Key Features

- **MCP Integration**: Connect to thousands of APIs through Pipedream's MCP server with built-in auth
- **Multi-model Support**: Works with any LLM provider
- **Real-time API Calls**: Execute tool calls across different APIs via chat
- **Responsive Design**: The chat app is optimized for both desktop and mobile devices

> Check out [Pipedream's developer docs](https://pipedream.com/docs/connect/mcp/developers) for the most up to date information.

### Development Mode

For local development, you can disable authentication and persistence:

```bash
# In your .env file
DISABLE_AUTH=true
DISABLE_PERSISTENCE=true
EXTERNAL_USER_ID=your-dev-user-id
```

This allows you to test the chat functionality without setting up authentication or database persistence.

> [!IMPORTANT]  
> Treat this project as a reference implementation for integrating MCP servers into AI applications.

## Model Providers

The demo app currentlys supports Anthropic Claude and OpenAI models, but the Vercel AI SDK supports most major LLM providers.

## Running locally

You can run this chat app in two ways:

### Option 1: From the monorepo root (recommended)

If you're working within the full MCP monorepo:

```bash
# From the root of the monorepo
cp .env.example .env  # Edit with your values
pnpm install
pnpm chat
```

This will automatically use the `.env` file from the root directory and start the chat app.

### Option 2: From this directory

If you're working directly in the chat example:

```bash
# From examples/chat directory
cp .env.example .env  # Edit with your values
```

Then run all required local services:

```bash
docker compose up -d
```

Run migrations:

```bash
POSTGRES_URL=postgresql://postgres@localhost:5432/postgres pnpm db:migrate
```

Then start the app:

```bash
pnpm install
pnpm chat
```

### Configuration

By default the client will point at https://remote.mcp.pipedream.net. Use the `MCP_SERVER` env var to point to an MCP server running locally:

```bash
MCP_SERVER=http://localhost:3010 pnpm chat
```

Your local app should now be running on [http://localhost:3000](http://localhost:3000/).
