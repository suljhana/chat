## Chatbot UI

Pipedream's fork of the [Next.js AI Chatbot](https://chat.vercel.ai/)

The goal is to show how you can use Pipedream's MCP servers to dynamically provide 
thousands of tools to the chat.

> [!IMPORTANT]  
> Treat this project as a reference.

## Model Providers

We allow Anthropic + OpenAI today. The Vercel AI SDK supports other providers.

## Running locally

`cp .env.example .env` and fill in the appropriate values.

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
pnpm dev
```

By default the client will point at https://mcp.pipedream.net.  Use the `MCP_SERVER` env var to point the mcp server you have running locally:

```bash
MCP_SERVER=http://localhost:3010 pnpm dev
```

Your local app should now be running on [http://localhost:3000](http://localhost:3000/).
