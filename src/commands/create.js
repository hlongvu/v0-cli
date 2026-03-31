import chalk from 'chalk'
import ora from 'ora'
import { getClient } from '../lib/client.js'

export async function createCommand(prompt, options) {
  const v0 = getClient()

  if (!prompt?.trim()) {
    console.error(chalk.red('  Error: A prompt is required to create a website.'))
    process.exit(1)
  }

  const spinner = ora({ text: 'Creating your website on v0.dev...', prefixText: '  ' }).start()

  let chat
  try {
    chat = await v0.chats.create({
      message: prompt.trim(),
      ...(options.system && { system: options.system }),
      chatPrivacy: options.privacy || 'public',
    })
    spinner.succeed('Website created!')
  } catch (err) {
    spinner.fail('Failed to create website')
    console.error(chalk.red(`\n  ${err.message}`))
    if (err.message?.includes('401') || err.message?.toLowerCase().includes('unauthorized')) {
      console.error(chalk.gray('  Check your V0_API_KEY at https://v0.dev/chat/settings/keys'))
    }
    process.exit(1)
  }

  const chatId = chat.id
  const webUrl = chat.webUrl || `https://v0.app/chat/${chatId}`

  console.log(chalk.gray('  Chat ID:  ') + chalk.white(chatId))
  console.log(chalk.gray('  Preview:  ') + chalk.cyan(webUrl))
  console.log()

  if (options.open !== false) {
    try {
      const { default: open } = await import('open')
      await open(webUrl)
    } catch {}
  }
}
