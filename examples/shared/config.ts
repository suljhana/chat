import { config } from "dotenv"
import { join, dirname } from "path"
import { existsSync } from "fs"
import { fileURLToPath } from "url"
import { z } from "zod"

/**
 * Load environment configuration for examples
 * Tries to load .env from local directory first, then from project root
 * @param importMetaUrl - Pass import.meta.url from the calling module
 */
export function loadConfig(importMetaUrl: string): void {
  // Get current file directory in ESM
  const __filename = fileURLToPath(importMetaUrl)
  const __dirname = dirname(__filename)

  // Try to load .env from local directory first, then from project root
  const localEnvPath = join(__dirname, '.env')
  const rootEnvPath = join(__dirname, '../../.env')

  const envPath = existsSync(localEnvPath) ? localEnvPath : rootEnvPath
  config({ path: envPath })
}

/**
 * Load and validate environment configuration with Zod schema
 * @param importMetaUrl - Pass import.meta.url from the calling module
 * @param schema - Zod schema to validate environment variables
 * @returns Parsed and validated environment configuration
 */
export function loadAndValidateConfig<T extends z.ZodRawShape>(
  importMetaUrl: string,
  schema: z.ZodObject<T>
): z.infer<z.ZodObject<T>> {
  // Load .env file first
  loadConfig(importMetaUrl)
  
  try {
    // Parse and validate environment variables
    return schema.parse(process.env)
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("❌ Environment validation failed:")
      error.errors.forEach((err: z.ZodIssue) => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`)
      })
      console.error("Please check your .env file")
    } else {
      console.error("❌ Unexpected error during environment validation:", error)
    }
    process.exit(1)
  }
}
