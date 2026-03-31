import readline from 'readline'
import chalk from 'chalk'
import ora from 'ora'
import { getClient } from './client.js'

export async function startChatSession(chatId, webUrl) {
  const v0 = getClient()

  console.log(chalk.bold('\n  Interactive Chat'))
  console.log(chalk.gray('  Type your message to refine the design.'))
  console.log(chalk.gray('  Commands: /open (browser), /url, /versions, /quit\n'))

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  const prompt = () =>
    new Promise((resolve) => {
      rl.question(chalk.cyan('  You: '), resolve)
    })

  let currentUrl = webUrl
  let running = true

  while (running) {
    let input
    try {
      input = await prompt()
    } catch {
      break
    }

    const trimmed = input.trim()
    if (!trimmed) continue

    // Handle slash commands
    if (trimmed.startsWith('/')) {
      const cmd = trimmed.toLowerCase()

      if (cmd === '/quit' || cmd === '/exit' || cmd === '/q') {
        running = false
        break
      }

      if (cmd === '/url') {
        console.log(chalk.gray(`\n  URL: ${chalk.cyan(currentUrl)}\n`))
        continue
      }

      if (cmd === '/open') {
        const { default: open } = await import('open')
        await open(currentUrl)
        console.log(chalk.gray('  Opened in browser.\n'))
        continue
      }

      if (cmd === '/versions') {
        const spinner = ora({ text: 'Fetching versions...', prefixText: '  ' }).start()
        try {
          const versions = await v0.chats.findVersions({ chatId })
          spinner.stop()
          if (!versions || versions.length === 0) {
            console.log(chalk.gray('  No versions found.\n'))
          } else {
            console.log(chalk.bold('\n  Versions:'))
            versions.forEach((v, i) => {
              const date = new Date(v.createdAt).toLocaleString()
              console.log(chalk.gray(`  ${i + 1}. [${v.status}] ${date} — ${v.id}`))
            })
            console.log()
          }
        } catch (err) {
          spinner.fail('Failed to fetch versions')
          console.error(chalk.red(`  ${err.message}\n`))
        }
        continue
      }

      if (cmd === '/help') {
        console.log(chalk.bold('\n  Available commands:'))
        console.log(chalk.gray('  /url       — Show the current v0.dev URL'))
        console.log(chalk.gray('  /open      — Open the chat in your browser'))
        console.log(chalk.gray('  /versions  — List all versions of this chat'))
        console.log(chalk.gray('  /quit      — Exit the chat session\n'))
        continue
      }

      console.log(chalk.yellow(`  Unknown command: ${trimmed}. Type /help for commands.\n`))
      continue
    }

    // Send message to v0 with streaming
    const spinner = ora({ text: 'Thinking...', prefixText: '  ' }).start()
    try {
      const stream = await v0.chats.sendMessage({
        chatId,
        message: trimmed,
        responseMode: 'experimental_stream',
      })

      spinner.stop()
      process.stdout.write(chalk.bold('\n  v0: '))

      let buffer = ''
      const decoder = new TextDecoder()
      const reader = stream.getReader()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })

        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6)
          if (data === '[DONE]') break
          try {
            const parsed = JSON.parse(data)
            const text = parsed?.choices?.[0]?.delta?.content || parsed?.text || ''
            if (text) process.stdout.write(chalk.white(text))
          } catch {}
        }
      }

      process.stdout.write('\n')

      // Refresh URL after response
      const updatedChat = await v0.chats.getById({ chatId }).catch(() => null)
      if (updatedChat?.webUrl && updatedChat.webUrl !== currentUrl) {
        currentUrl = updatedChat.webUrl
      }

      console.log(chalk.gray(`\n  Preview: ${chalk.cyan(currentUrl)}\n`))
    } catch (err) {
      spinner.fail('Failed to send message')
      console.error(chalk.red(`  ${err.message}\n`))
    }
  }

  rl.close()
  console.log(chalk.gray('\n  Session ended.'))
  console.log(chalk.cyan(`  Final URL: ${currentUrl}\n`))
}
