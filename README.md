# MCP (Model Context Protocol)

This repository contains examples and tools for working with the Model Context Protocol (MCP).

## Project Structure

```
.
└── examples/           # Example implementations
    ├── ai-sdk/         # AI SDK implementation example
    └── openai-sdk/     # OpenAI SDK implementation example
```

## Getting Started

This project uses pnpm workspaces for package management. Make sure you have pnpm installed:

```bash
npm install -g pnpm
```

### Installation

Install all dependencies:

```bash
pnpm install
```

### Running Examples

You can run the examples using the following commands from the root directory:

#### AI SDK Example
```bash
# Development mode
pnpm dev:ai-sdk

# Run the web SDK example
pnpm web:ai-sdk

# Production mode
pnpm start:ai-sdk
```

#### OpenAI SDK Example
```bash
# Development mode
pnpm dev:openai-sdk

# Production mode
pnpm start:openai-sdk
```

### Building

To build all packages:

```bash
pnpm build
```

## License

MIT 