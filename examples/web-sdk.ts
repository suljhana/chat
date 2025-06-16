import { config } from "dotenv"
import { experimental_createMCPClient, generateText, CoreMessage } from "ai"
import OpenAI from "openai"
import { Command } from "commander"

config()

// Validate OPENAI_API_KEY
if (!process.env.OPENAI_API_KEY) {
  console.error("❌ Missing required environment variable: OPENAI_API_KEY")
  console.error("Please set it in your .env file")
  process.exit(1)
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const program = new Command()

interface ProgramOptions {
  model: string
  maxSteps: number
  mcpUrl: string
}

program
  .name("web-sdk")
  .description("OpenAI Web SDK CLI tool with MCP integration")
  .version("1.0.0")
  .argument("<instruction>", "The instruction to process")
  .requiredOption("-u, --mcp-url <url>", "MCP server URL (required)")
  .option("-m, --model <model>", "OpenAI model to use", "gpt-4-1106-preview")
  .option("-s, --max-steps <steps>", "Maximum conversation steps", "10")
  .action(async (instruction: string, options: ProgramOptions) => {
    const maxSteps = parseInt(options.maxSteps.toString())
    if (isNaN(maxSteps)) {
      console.error("❌ max-steps must be a number")
      process.exit(1)
    }

    let mcpClient: Awaited<ReturnType<typeof experimental_createMCPClient>> | undefined
    
    try {
      console.log("🤖 Initializing Web SDK with MCP client...")
      
      mcpClient = await experimental_createMCPClient({
        transport: {
          type: 'sse',
          url: options.mcpUrl,
          headers: {
            'Content-Type': 'application/json',
          },
        },
      })
      
      console.log("✅ MCP client initialized")
      
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
        }
      ]

      let ended = false
      let steps = 0
      
      console.log(`🎯 Processing instruction: "${instruction}"`)
      console.log(`📋 Configuration:
- Model: ${options.model}
- Max Steps: ${maxSteps}
- MCP URL: ${options.mcpUrl}
`)
      console.log("📝 Starting conversation loop...\n")

      while (!ended && steps < maxSteps) {
        console.log(`📍 Step ${steps + 1}/${maxSteps}`)
        
        // Get tools from MCP client before each step
        console.log("🔧 Loading tools from MCP server...")
        const tools = await mcpClient.tools()
        const toolNames = Object.keys(tools).join(", ")
        console.log(`📋 Available tools: ${toolNames || "none"}`)
        
        console.log("🧠 Generating AI response...")
        
        // Create function definitions for OpenAI
        const functionDefinitions = Object.entries(tools).map(([name, tool]) => ({
          name,
          description: tool.description,
          parameters: tool.parameters,
        }))

        // Make API call using OpenAI Web SDK
        const completion = await openai.chat.completions.create({
          model: options.model,
          messages: messages.map(msg => ({
            role: msg.role === "tool" ? "assistant" : msg.role,
            content: typeof msg.content === "string" ? msg.content : JSON.stringify(msg.content),
          })),
          tools: functionDefinitions,
          tool_choice: "auto",
        })

        const response = completion.choices[0]
        const responseMessage = response.message

        if (responseMessage.tool_calls) {
          console.log("🔨 Tool calls made:")
          const toolResults = []
          
          for (const toolCall of responseMessage.tool_calls) {
            console.log(`  - ${toolCall.function.name}`)
            console.log(`     Args: ${toolCall.function.arguments}`)
            
            // Execute tool call
            const tool = tools[toolCall.function.name]
            if (tool) {
              const result = await tool.execute(JSON.parse(toolCall.function.arguments))
              toolResults.push(result)
              console.log(`     Result: ${JSON.stringify(result, null, 2)}`)
            }
          }

          messages.push(
            {
              role: "assistant",
              content: responseMessage.tool_calls,
            },
            {
              role: "tool",
              content: toolResults,
            }
          )
        } else {
          console.log(`✨ Response: ${responseMessage.content}`)
          ended = true
        }
        
        steps++
        
        if (!ended && steps < maxSteps) {
          console.log("⏳ Continuing to next step...\n")
        }
      }
      
      if (steps >= maxSteps) {
        console.log(`⚠️  Reached maximum steps (${maxSteps})`)
      }
      
      console.log("\n🎉 Session complete!")
      
    } catch (error) {
      console.error("💥 Error occurred:", error)
      process.exit(1)
    } finally {
      if (mcpClient) {
        console.log("🧹 Closing MCP client...")
        await mcpClient.close()
        console.log("✅ MCP client closed")
      }
    }
  })

process.on('SIGINT', async () => {
  console.log('\n🛑 Received SIGINT, shutting down gracefully...')
  process.exit(0)
})

process.on('SIGTERM', async () => {
  console.log('\n🛑 Received SIGTERM, shutting down gracefully...')
  process.exit(0)
})

program.parse() 