# v0-cli

CLI for creating and iterating on websites with [v0.dev](https://v0.dev). Designed for machine/agent use.

## Install

```bash
npm install -g @hlongvu/v0-cli
```

Or build from source:

```bash
npm install
npm run pack
npm install -g @hlongvu/v0-cli-1.0.0.tgz
```

## Setup

Get your API key from https://v0.dev/chat/settings/keys and export it:

```bash
export V0_API_KEY=your_key_here
```

## Commands

### Create a website

```bash
v0 create <prompt> [options]
```

| Option | Description | Default |
|--------|-------------|---------|
| `-p, --privacy` | `public`, `private`, or `unlisted` | `public` |
| `-s, --system` | Custom system prompt | — |
| `--no-open` | Skip opening browser | opens browser |

```bash
v0 create "A dark SaaS landing page" --no-open
# Output:
#   Chat ID:  abc123
#   Preview:  https://v0.app/chat/abc123
```

### Send a message to an existing chat

```bash
v0 chat <chatId> <message>
```

```bash
v0 chat abc123 "Add a dark mode toggle to the header"
```

### List all chats

```bash
v0 list [--limit <n>]
```

## Agent Workflow

```bash
# Create and capture the chat ID
output=$(v0 create "Portfolio site with dark theme" --no-open 2>&1)
chatId=$(echo "$output" | grep "Chat ID:" | awk '{print $NF}')

# Iterate
v0 chat "$chatId" "Add a contact form"
v0 chat "$chatId" "Make it mobile responsive"
```
