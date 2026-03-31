import { createClient } from 'v0-sdk'
import chalk from 'chalk'

let _client = null

export function getClient() {
  if (_client) return _client

  const apiKey = process.env.V0_API_KEY
  if (!apiKey) {
    console.error(chalk.red('Error: V0_API_KEY environment variable is not set.'))
    console.error(chalk.gray('  Get your API key at: https://v0.dev/chat/settings/keys'))
    console.error(chalk.gray('  Then run: export V0_API_KEY=your_key_here'))
    process.exit(1)
  }

  _client = createClient({ apiKey })
  return _client
}
