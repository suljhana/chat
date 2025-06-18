import OpenAI from "openai";
import dotenv from "dotenv";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import {
  createBaseProgram,
  validateAndParseOptions,
  createMCPTransport,
  logProcessingStart,
  logStep,
  logToolsLoading,
  logAvailableTools,
  logAIResponse,
  logResponse,
  logToolCalls,
  logExecutingTools,
  logConversationComplete,
  logMaxStepsReached,
  logSessionComplete,
  logClosingClient,
  logClientClosed,
  logContinuing,
  setupGracefulShutdown,
  handleError,
  SYSTEM_PROMPT,
  ProgramOptions,
} from "@pipedream/shared/cli.js";

dotenv.config();

const program = createBaseProgram(
  "openai-sdk",
  "OpenAI SDK CLI tool with MCP integration"
);

program.action(async (instruction: string, options: ProgramOptions) => {
  const config = validateAndParseOptions(instruction, options);

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  let mcpClient: Client | undefined;

  try {
    logProcessingStart(config, "OpenAI SDK");

    const transport = await createMCPTransport(config.options.external_user_id);

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
        content: SYSTEM_PROMPT,
      },
      {
        role: "user",
        content: config.instruction,
      },
    ];

    let ended = false;
    let steps = 0;

    while (!ended && steps < config.maxSteps) {
      logStep(steps + 1, config.maxSteps);

      // Get tools from MCP client before each step
      logToolsLoading();
      const toolsResponse = await mcpClient.listTools();
      const mcpTools = toolsResponse.tools || [];
      const toolNames = mcpTools.map((tool) => tool.name).join(", ");
      logAvailableTools(toolNames);

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

      logAIResponse();

      const response = await openai.chat.completions.create({
        model: config.options.model as any,
        messages: messages,
        tools: openaiTools.length > 0 ? openaiTools : undefined,
        tool_choice: openaiTools.length > 0 ? "auto" : undefined,
      });

      const choice = response.choices[0];
      const assistantMessage = choice.message;

      logResponse(assistantMessage.content || "(no text content)");

      // Add assistant message to conversation
      messages.push(assistantMessage);

      switch (choice.finish_reason) {
        case "stop":
        case "content_filter":
          ended = true;
          logConversationComplete();
          break;

        case "tool_calls":
          if (assistantMessage.tool_calls) {
            logToolCalls();
            assistantMessage.tool_calls.forEach((toolCall, index) => {
              console.log(`  ${index + 1}. ${toolCall.function.name}`);
              console.log(`     Args: ${toolCall.function.arguments}`);
            });

            logExecutingTools();
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

      if (!ended && steps < config.maxSteps) {
        logContinuing();
      }
    }

    if (steps >= config.maxSteps) {
      logMaxStepsReached(config.maxSteps);
    }

    logSessionComplete();
  } catch (error) {
    handleError(error, "OpenAI SDK");
  } finally {
    if (mcpClient) {
      logClosingClient();
      await mcpClient.close();
      logClientClosed();
    }
  }
});

setupGracefulShutdown();

program.parse();
