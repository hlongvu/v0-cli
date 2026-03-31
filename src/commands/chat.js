import chalk from 'chalk'
import ora from 'ora'
import { getClient } from '../lib/client.js'
import { startChatSession } from '../lib/chat-session.js'

export async function chatCommand(chatId) {
  const v0 = getClient()

  const spinner = ora({ text: 'Fetching chat...', prefixText: '  ' }).start()
  let chat
  try {
    chat = await v0.chats.getById({ chatId })
    spinner.stop()
  } catch (err) {
    spinner.fail('Failed to fetch chat')
    console.error(chalk.red(`\n  ${err.message}`))
    process.exit(1)
  }

  const webUrl = chat.webUrl || `https://v0.dev/chat/${chatId}`

  console.log(chalk.bold('\n  Resuming chat'))
  console.log(chalk.gray('  Chat ID: ') + chalk.white(chatId))
  if (chat.name) {
    console.log(chalk.gray('  Name:    ') + chalk.white(chat.name))
  }
  console.log(chalk.gray('  URL:     ') + chalk.cyan(webUrl))

  await startChatSession(chatId, webUrl)
}
