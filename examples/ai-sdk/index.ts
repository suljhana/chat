import { openai } from "@ai-sdk/openai";
import { CoreMessage, experimental_createMCPClient, generateText } from "ai";
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
  logToolResults,
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

const program = createBaseProgram(
  "ai-sdk",
  "AI SDK CLI tool with MCP integration"
);

program.action(async (instruction: string, options: ProgramOptions) => {
  const config = validateAndParseOptions(instruction, options);

  let mcpClient:
    | Awaited<ReturnType<typeof experimental_createMCPClient>>
    | undefined;

  try {
    logProcessingStart(config, "AI SDK");

    const transport = await createMCPTransport(config.options.external_user_id);

    mcpClient = await experimental_createMCPClient({
      transport,
    });

    console.log("✅ MCP client initialized");

    // Initial system message
    const messages: CoreMessage[] = [
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
      const tools = await mcpClient.tools();
      const toolNames = Object.keys(tools).join(", ");
      logAvailableTools(toolNames);

      logAIResponse();
      const response = await generateText({
        model: openai(config.options.model as any),
        messages,
        tools,
        maxSteps: 1, // Handle one step at a time so we are able to reload the tools in between steps
      });

      logResponse(response.text);

      switch (response.finishReason) {
        case "stop":
        case "content-filter":
          ended = true;
          logConversationComplete();
          break;

        case "error":
          ended = true;
          console.error("❌ An error occurred during generation");
          break;

        case "tool-calls":
          logToolCalls();
          response.toolCalls.forEach((toolCall, index) => {
            console.log(`  ${index + 1}. ${toolCall.toolName}`);
            console.log(
              `     Args: ${JSON.stringify(toolCall.args, null, 2)}`
            );
          });

          logToolResults();
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

      if (!ended && steps < config.maxSteps) {
        logContinuing();
      }
    }

    if (steps >= config.maxSteps) {
      logMaxStepsReached(config.maxSteps);
    }

    logSessionComplete();
  } catch (error) {
    handleError(error, "AI SDK");
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
