# v0-cli — AI Agent Skill Reference

A CLI tool for creating and iterating on websites using [v0.dev](https://v0.dev) from the terminal.

## Prerequisites

- Node.js >= 18
- `V0_API_KEY` environment variable set (obtain from https://v0.dev/chat/settings/keys)
- Dependencies installed: `npm install` in this directory

## Invocation

```bash
node /path/to/v0-cli/src/index.js <command> [options]
```

Or if globally linked (`npm link`):

```bash
v0 <command> [options]
```

---

## Commands

### `create` — Create a new website

```bash
v0 create [prompt] [options]
```

**Arguments:**
- `prompt` *(optional)* — Natural language description of the website to generate. If omitted, the CLI will prompt interactively.

**Options:**
| Flag | Description | Default |
|------|-------------|---------|
| `-p, --privacy <privacy>` | `public`, `private`, or `unlisted` | `public` |
| `-s, --system <system>` | Custom system prompt for the AI | — |
| `--no-open` | Skip opening the browser after creation | opens browser |
| `--no-chat` | Skip the interactive chat loop after creation | starts chat |

**Examples:**
```bash
# Create with inline prompt, skip browser + chat (good for automation)
v0 create "A dark SaaS landing page with hero, features, and pricing" --no-open --no-chat

# Create private chat with custom system prompt
v0 create "Admin dashboard" --privacy private --system "Use shadcn/ui components"

# Create and immediately drop into chat loop
v0 create "E-commerce product page"
```

**Output (stdout):**
```
  Website created!

  Your website is ready!
  Chat ID:  <chatId>
  Preview:  https://v0.dev/chat/<chatId>
```

**Key output to parse:** `Chat ID:` line — extract the `chatId` for follow-up `sendMessage` calls.

---

### `chat` — Continue an existing chat

```bash
v0 chat <chatId>
```

**Arguments:**
- `chatId` *(required)* — The ID of an existing v0 chat.

Starts an interactive readline loop. For non-interactive/automated use, prefer calling the SDK directly or piping messages.

**Example:**
```bash
v0 chat abc123xyz
```

---

### `list` — List all chats

```bash
v0 list [options]
```

**Options:**
| Flag | Description | Default |
|------|-------------|---------|
| `-l, --limit <n>` | Max number of chats to display | `20` |

**Output format:**
```
   1. <name> [public] 3/31/2026
      ID:  <chatId>
      URL: https://v0.dev/chat/<chatId>
```

---

## Interactive Chat Commands

When inside a chat session (after `create` or `chat`), these slash commands are available:

| Command | Description |
|---------|-------------|
| `/url` | Print the current v0.dev preview URL |
| `/open` | Open the current URL in the default browser |
| `/versions` | List all saved versions of this chat |
| `/help` | Show available commands |
| `/quit` or `/exit` | End the session |

Any other input is sent as a message to v0 to refine the design.

---

## Automation / Non-Interactive Usage

For AI agents that need to create a site and get back the `chatId` without entering an interactive loop:

```bash
output=$(v0 create "A portfolio site with dark theme" --no-open --no-chat 2>&1)
chatId=$(echo "$output" | grep "Chat ID:" | awk '{print $NF}')
echo "Chat ID: $chatId"
```

Then to send a follow-up message programmatically, use the SDK directly:

```js
import { createClient } from 'v0-sdk'
const v0 = createClient({ apiKey: process.env.V0_API_KEY })
await v0.chats.sendMessage({ chatId, message: 'Add a dark mode toggle' })
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `V0_API_KEY` | Yes | API key from https://v0.dev/chat/settings/keys |

---

## Error Handling

| Scenario | Behavior |
|----------|----------|
| Missing `V0_API_KEY` | Prints instructions and exits with code 1 |
| Invalid API key (401) | Prints error with link to settings page |
| Chat not found (404) | Prints error and exits with code 1 |
| Rate limit (429) | Prints error message from API |

---

## Typical Agent Workflow

```
1. Run `v0 create "<description>" --no-open --no-chat`
2. Parse chatId from output
3. Open https://v0.dev/chat/<chatId> for human review (optional)
4. Run `v0 chat <chatId>` or use SDK to send refinement messages
5. Run `v0 list` to enumerate and manage all chats
```
