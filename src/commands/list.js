import chalk from 'chalk'
import ora from 'ora'
import { getClient } from '../lib/client.js'

export async function listCommand(options) {
  const v0 = getClient()

  const spinner = ora({ text: 'Fetching chats...', prefixText: '  ' }).start()
  let chats
  try {
    chats = (await v0.chats.find()).data
    spinner.stop()
  } catch (err) {
    spinner.fail('Failed to fetch chats')
    console.error(chalk.red(`\n  ${err.message}`))
    process.exit(1)
  }

  const limit = parseInt(options.limit, 10) || 20
  const displayed = chats.slice(0, limit)

  if (displayed.length === 0) {
    console.log(chalk.gray('\n  No chats found. Create one with: v0 create\n'))
    return
  }

  console.log(chalk.bold(`\n  Your v0 Chats (${displayed.length} of ${chats.length}):\n`))

  displayed.forEach((chat, i) => {
    const num = chalk.gray(`  ${String(i + 1).padStart(2)}.`)
    const name = chat.name ? chalk.white(chat.name) : chalk.gray('Untitled')
    const date = chalk.gray(new Date(chat.createdAt).toLocaleDateString())
    const privacy = chalk.gray(`[${chat.privacy}]`)
    const id = chalk.gray(chat.id)
    const url = chalk.cyan(chat.webUrl || '')

    console.log(`${num} ${name} ${privacy} ${date}`)
    console.log(chalk.gray(`      ID:  ${id}`))
    console.log(chalk.gray(`      URL: ${url}`))
    console.log()
  })

  console.log(chalk.gray(`  To continue a chat: v0 chat <chatId>`))
  console.log(chalk.gray(`  To create a new one: v0 create\n`))
}
