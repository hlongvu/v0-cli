#!/usr/bin/env node

import { program } from 'commander'
import chalk from 'chalk'
import { createCommand } from './commands/create.js'
import { chatCommand } from './commands/chat.js'
import { listCommand } from './commands/list.js'

const VERSION = '1.0.0'

console.log(chalk.bold.cyan('\n  v0 CLI') + chalk.gray(` v${VERSION}\n`))

program
  .name('v0')
  .description('Create and iterate on websites with v0.dev from your terminal')
  .version(VERSION)

program
  .command('create [prompt]')
  .description('Create a new website on v0.dev')
  .option('-p, --privacy <privacy>', 'Chat privacy: public, private, or unlisted', 'public')
  .option('-s, --system <system>', 'System prompt for the AI')
  .option('--no-open', 'Do not open the browser after creation')
  .action(createCommand)

program
  .command('chat <chatId> <message>')
  .description('Send a message to an existing v0 chat')
  .action(chatCommand)

program
  .command('list')
  .description('List all your v0 chats')
  .option('-l, --limit <n>', 'Maximum number of chats to show', '20')
  .action(listCommand)

program.parse()
