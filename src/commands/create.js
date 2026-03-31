import readline from 'readline'
import chalk from 'chalk'
import ora from 'ora'
import { getClient } from '../lib/client.js'
import { startChatSession } from '../lib/chat-session.js'

export async function createCommand(prompt, options) {
  const v0 = getClient()

  // If no prompt given, ask interactively
  if (!prompt) {
    prompt = await askPrompt()
  }

  if (!prompt?.trim()) {
    console.error(chalk.red('  Error: A prompt is required to create a website.'))
    process.exit(1)
  }

  console.log()
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
  const webUrl = chat.webUrl || `https://v0.dev/chat/${chatId}`

  console.log(chalk.bold('\n  Your website is ready!'))
  console.log(chalk.gray('  Chat ID:  ') + chalk.white(chatId))
  console.log(chalk.gray('  Preview:  ') + chalk.cyan(webUrl))
  console.log()

  // Open in browser
  if (options.open !== false) {
    try {
      const { default: open } = await import('open')
      await open(webUrl)
      console.log(chalk.gray('  Opened in browser.'))
    } catch {
      // silently skip if open fails
    }
  }

  // Start interactive chat
  if (options.chat !== false) {
    await startChatSession(chatId, webUrl)
  }
}

function askPrompt() {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
    rl.question(
      chalk.bold('  Describe the website you want to create:\n  ') + chalk.cyan('> '),
      (answer) => {
        rl.close()
        resolve(answer)
      },
    )
  })
}
