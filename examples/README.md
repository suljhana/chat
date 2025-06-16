# AI SDK MCP Examples

This directory contains examples of using the AI SDK with Model Context Protocol (MCP) integration.

## Overview

This example demonstrates how to build a system that integrates with the MCP server to enable dynamic tool loading. The key feature is the ability to reload available tools between conversation steps, allowing the AI to adapt to changes in the tool set during execution.

## Examples

This repository contains two examples:

1. **AI SDK Example** (`ai-sdk.ts`): Uses the AI SDK's built-in OpenAI integration
2. **Web SDK Example** (`web-sdk.ts`): Uses the OpenAI Web SDK directly with MCP integration

Both examples demonstrate:
- Dynamic tool reloading between conversation steps
- Command-line interface for flexible configuration
- Support for different AI models and conversation parameters

## Installation

1. Clone the repository and navigate to the examples directory:
```bash
cd examples
```

2. Install dependencies:
```bash
pnpm install
```

3. Create a `.env` file with your OpenAI API key:
```bash
OPENAI_API_KEY=your_api_key_here
```

## Usage

### AI SDK Example
```bash
# Basic usage (MCP URL is required)
pnpm example:ai-sdk -- "Send a joke to #random" -u http://localhost:3010/v1/<external user id>

# Specify all options
pnpm example:ai-sdk -- "Send a joke to #random" -u http://localhost:3010/v1/<external user id> -m gpt-4-1106-preview -s 5

# Show help
pnpm run example:ai-sdk -- --help
```

### Web SDK Example
```bash
# Basic usage (MCP URL is required)
pnpm example:web-sdk -- "Send a joke to #random" -u http://localhost:3010/v1/<external user id>

# Specify all options
pnpm example:web-sdk -- "Send a joke to #random" -u http://localhost:3010/v1/<external user id> -m gpt-4-1106-preview -s 5

# Show help
pnpm run example:web-sdk -- --help
```

## Key Differences

1. **AI SDK Example**:
   - Uses the AI SDK's built-in OpenAI integration
   - Simpler implementation with less boilerplate
   - Handles tool calling automatically

2. **Web SDK Example**:
   - Uses the OpenAI Web SDK directly
   - More control over the OpenAI API calls
   - Manual handling of tool calls and responses
   - Useful when you need more flexibility or direct access to OpenAI features

## Environment Variables

The tool requires only one environment variable:

- `OPENAI_API_KEY` - Your OpenAI API key (required)

All other configuration is handled through command line arguments, with the MCP URL being a required option.

## How it Works

The CLI tool:

1. **Initialization**: Creates an MCP client connection to a configured server
2. **Tool Loading**: Before each AI generation step, loads available tools from the MCP server
3. **AI Generation**: Uses OpenAI GPT-4o-mini with the loaded tools to process the instruction
4. **Loop Handling**: Continues the conversation for up to 10 steps, handling tool calls automatically
5. **Cleanup**: Properly closes the MCP client connection when finished

## Configuration

### MCP Server Setup

The default configuration assumes:
- MCP server running on `http://localhost:3000/mcp` (SSE transport)
- Server supports the standard MCP tool protocol

To use a different transport, modify the `experimental_createMCPClient` call in `ai-sdk`:

**For stdio transport:**
```javascript
mcpClient = await experimental_createMCPClient({
  transport: new Experimental_StdioMCPTransport({
    command: 'node',
    args: ['path/to/your/mcp-server.js'],
  }),
})
```

**For custom transport:**
```javascript
mcpClient = await experimental_createMCPClient({
  transport: new YourCustomTransport({
    // your configuration
  }),
})
```

### Environment Variables

The tool uses these environment variables:
- `OPENAI_API_KEY` - Your OpenAI API key (required)

## Features

- ✅ CLI argument parsing
- ✅ MCP client integration
- ✅ Tool loading before each step
- ✅ Multi-step conversation handling
- ✅ Proper error handling and cleanup
- ✅ Graceful shutdown on SIGINT/SIGTERM
- ✅ Detailed logging and progress indicators

## Architecture

The tool follows a similar pattern to the sub-agent-tool.ts:

1. **Message Management**: Maintains conversation history with system and user messages
2. **Tool Integration**: Dynamically loads tools from MCP server before each AI call
3. **Response Processing**: Handles different finish reasons (stop, tool-calls, error, etc.)
4. **State Management**: Tracks conversation steps and manages the generation loop

## Debugging

Enable verbose logging by setting:
```bash
export DEBUG=ai-sdk:*
```

The tool provides detailed console output including:
- MCP client initialization status
- Available tools for each step
- Tool call details and results
- Conversation flow and finish reasons

## Limitations

- Maximum 10 conversation steps per session
- Uses OpenAI GPT-4o-mini model (configurable)
- Requires MCP server to be running and accessible
- Limited to tools provided by the configured MCP server

## Contributing

To extend the tool:

1. Modify the MCP client configuration for different transports
2. Add custom error handling for specific use cases
3. Implement different AI models or providers
4. Add support for streaming responses
5. Extend logging and monitoring capabilities 