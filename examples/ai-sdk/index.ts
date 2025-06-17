import { openai } from "@ai-sdk/openai";
import { config as pdConfig, pdHeaders } from "@pipedream/shared/pd.js";
import { CoreMessage, experimental_createMCPClient, generateText } from "ai";
import { Command } from "commander";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp";

const program = new Command();

interface ProgramOptions {
  model: string;
  maxSteps: number;
  external_user_id: string;
}

program
  .name("ai-sdk")
  .description("AI SDK CLI tool with MCP integration")
  .version("1.0.0")
  .argument("<instruction>", "The instruction to process")
  .requiredOption(
    "-u, --external_user_id <extuid>",
    "External user ID (required)"
  )
  .option("-m, --model <model>", "OpenAI model to use", "gpt-4-1106-preview")
  .option("-s, --max-steps <steps>", "Maximum conversation steps", "10")
  .action(async (instruction: string, options: ProgramOptions) => {
    const maxSteps = parseInt(options.maxSteps.toString());
    if (isNaN(maxSteps)) {
      console.error("❌ max-steps must be a number");
      process.exit(1);
    }

    let mcpClient:
      | Awaited<ReturnType<typeof experimental_createMCPClient>>
      | undefined;

    try {
      console.log("🤖 Initializing AI SDK with MCP client...");

      const headers = await pdHeaders(options.external_user_id);
      const mcpUrl = new URL(
        pdConfig.MCP_HOST + `/v1/${options.external_user_id}`
      );

      const transport = new StreamableHTTPClientTransport(mcpUrl, {
        requestInit: {
          headers,
        },
      });

      mcpClient = await experimental_createMCPClient({
        transport,
      });

      console.log("✅ MCP client initialized");

      // Initial system message
      const messages: CoreMessage[] = [
        {
          role: "system",
          content: `You are an intelligent AI assistant that can use tools to help users.

You have access to various tools through the Model Context Protocol (MCP).
Use the available tools to fulfill the user's request effectively.

If you encounter any errors or need clarification, explain what happened and suggest next steps.`,
        },
        {
          role: "user",
          content: instruction,
        },
      ];

      let ended = false;
      let steps = 0;

      console.log(`🎯 Processing instruction: "${instruction}"`);
      console.log(`📋 Configuration:
- Model: ${options.model}
- Max Steps: ${maxSteps}
- MCP URL: ${pdConfig.MCP_HOST}
`);
      console.log("📝 Starting conversation loop...\n");

      while (!ended && steps < maxSteps) {
        console.log(`📍 Step ${steps + 1}/${maxSteps}`);

        // Get tools from MCP client before each step
        console.log("🔧 Loading tools from MCP server...");
        const tools = await mcpClient.tools();
        const toolNames = Object.keys(tools).join(", ");
        console.log(`📋 Available tools: ${toolNames || "none"}`);

        console.log("🧠 Generating AI response...");
        const response = await generateText({
          model: openai(options.model as any),
          messages,
          tools,
          maxSteps: 1, // Handle one step at a time so we are able to reload the tools in between steps
        });

        console.log(`✨ Response: ${response.text}`);

        switch (response.finishReason) {
          case "stop":
          case "content-filter":
            ended = true;
            console.log("✅ Conversation completed successfully");
            break;

          case "error":
            ended = true;
            console.error("❌ An error occurred during generation");
            break;

          case "tool-calls":
            console.log("🔨 Tool calls made:");
            response.toolCalls.forEach((toolCall, index) => {
              console.log(`  ${index + 1}. ${toolCall.toolName}`);
              console.log(
                `     Args: ${JSON.stringify(toolCall.args, null, 2)}`
              );
            });

            console.log("📊 Tool results:");
            response.toolResults.forEach((result, index) => {
              console.log(`  ${index + 1}. ${JSON.stringify(result, null, 2)}`);
            });

            messages.push(
              {
                role: "assistant",
                content: response.toolCalls,
              },
              {
                role: "tool",
                content: response.toolResults,
              }
            );
            break;

          case "length":
            console.log("⚠️  Response truncated due to length limit");
            ended = true;
            break;

          default:
            console.log(`🤔 Unknown finish reason: ${response.finishReason}`);
            ended = true;
        }

        steps++;

        if (!ended && steps < maxSteps) {
          console.log("⏳ Continuing to next step...\n");
        }
      }

      if (steps >= maxSteps) {
        console.log(`⚠️  Reached maximum steps (${maxSteps})`);
      }

      console.log("\n🎉 Session complete!");
    } catch (error) {
      console.log("Error", error);
      console.error("💥 Error occurred:", error);
      process.exit(1);
    } finally {
      if (mcpClient) {
        console.log("🧹 Closing MCP client...");
        await mcpClient.close();
        console.log("✅ MCP client closed");
      }
    }
  });

process.on("SIGINT", async () => {
  console.log("\n🛑 Received SIGINT, shutting down gracefully...");
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\n🛑 Received SIGTERM, shutting down gracefully...");
  process.exit(0);
});

program.parse();
