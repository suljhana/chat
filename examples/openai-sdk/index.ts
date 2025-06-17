import OpenAI from "openai";
import dotenv from "dotenv";
import { Command } from "commander";
import { config as pdConfig, pdHeaders } from "@pipedream/shared/pd.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";

dotenv.config();

const program = new Command();

interface ProgramOptions {
  model: string;
  maxSteps: number;
  external_user_id: string;
}

program
  .name("openai-sdk")
  .description("OpenAI SDK CLI tool with MCP integration")
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

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    let mcpClient: Client | undefined;

    try {
      console.log("🤖 Initializing OpenAI SDK with MCP client...");

      const headers = await pdHeaders(options.external_user_id);
      const mcpUrl = new URL(
        pdConfig.MCP_HOST + `/v1/${options.external_user_id}`
      );

      const transport = new StreamableHTTPClientTransport(mcpUrl, {
        requestInit: {
          headers,
        },
      });

      mcpClient = new Client({
        name: "pd-example-client",
        version: "1.0.0",
      });

      await mcpClient.connect(transport);

      console.log("✅ MCP client initialized");

      // Initial messages
      const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
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
        const toolsResponse = await mcpClient.listTools();
        const mcpTools = toolsResponse.tools || [];
        const toolNames = mcpTools.map((tool) => tool.name).join(", ");
        console.log(`📋 Available tools: ${toolNames || "none"}`);

        // Convert MCP tools to OpenAI tools format
        const openaiTools: OpenAI.Chat.Completions.ChatCompletionTool[] =
          mcpTools.map((tool: any) => ({
            type: "function",
            function: {
              name: tool.name,
              description: tool.description,
              parameters: tool.inputSchema,
            },
          }));

        console.log("🧠 Generating AI response...");

        const response = await openai.chat.completions.create({
          model: options.model as any,
          messages: messages,
          tools: openaiTools.length > 0 ? openaiTools : undefined,
          tool_choice: openaiTools.length > 0 ? "auto" : undefined,
        });

        const choice = response.choices[0];
        const assistantMessage = choice.message;

        console.log(
          `✨ Response: ${assistantMessage.content || "(no text content)"}`
        );

        // Add assistant message to conversation
        messages.push(assistantMessage);

        switch (choice.finish_reason) {
          case "stop":
          case "content_filter":
            ended = true;
            console.log("✅ Conversation completed successfully");
            break;

          case "tool_calls":
            if (assistantMessage.tool_calls) {
              console.log("🔨 Tool calls made:");
              assistantMessage.tool_calls.forEach((toolCall, index) => {
                console.log(`  ${index + 1}. ${toolCall.function.name}`);
                console.log(`     Args: ${toolCall.function.arguments}`);
              });

              console.log("📊 Executing tool calls...");
              const toolResults: OpenAI.Chat.Completions.ChatCompletionMessageParam[] =
                [];

              for (const toolCall of assistantMessage.tool_calls) {
                try {
                  const toolName = toolCall.function.name;
                  const toolArgs = JSON.parse(toolCall.function.arguments);

                  // Execute the tool via MCP client using callTool
                  const result = await mcpClient.callTool({
                    name: toolName,
                    arguments: toolArgs,
                  });

                  toolResults.push({
                    role: "tool",
                    tool_call_id: toolCall.id,
                    content: JSON.stringify(result),
                  });

                  console.log(
                    `  ✅ ${toolName}: ${JSON.stringify(result, null, 2)}`
                  );
                } catch (error) {
                  console.error(
                    `  ❌ Error executing ${toolCall.function.name}:`,
                    error
                  );
                  toolResults.push({
                    role: "tool",
                    tool_call_id: toolCall.id,
                    content: `Error: ${
                      error instanceof Error ? error.message : String(error)
                    }`,
                  });
                }
              }

              // Add tool results to conversation
              messages.push(...toolResults);
            }
            break;

          case "length":
            console.log("⚠️  Response truncated due to length limit");
            ended = true;
            break;

          default:
            console.log(`🤔 Unknown finish reason: ${choice.finish_reason}`);
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
