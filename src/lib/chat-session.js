import chalk from 'chalk'
import ora from 'ora'
import { getClient } from './client.js'

export async function sendMessage(chatId, message) {
  const v0 = getClient()

  const spinner = ora({ text: 'Thinking...', prefixText: '  ' }).start()
  let stream
  try {
    stream = await v0.chats.sendMessage({
      chatId,
      message,
      responseMode: 'experimental_stream',
    })
    spinner.stop()
  } catch (err) {
    spinner.fail('Failed to send message')
    console.error(chalk.red(`  ${err.message}`))
    process.exit(1)
  }

  process.stdout.write(chalk.bold('\n  v0: '))

  const decoder = new TextDecoder()
  const reader = stream.getReader()
  let buffer = ''

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

  process.stdout.write('\n\n')

  const updatedChat = await v0.chats.getById({ chatId }).catch(() => null)
  const webUrl = updatedChat?.webUrl || `https://v0.app/chat/${chatId}`
  console.log(chalk.gray('  Preview: ') + chalk.cyan(webUrl))
  console.log()
}
