# PlumberKit

PlumberKit is a GitHub Copilot plugin that contains many useful tools for developers. Contains Agents, skills and MCP Server tested and ready to use.

## Overview

PlumberKit is a [GitHub Copilot Extension](https://docs.github.com/en/copilot/building-copilot-extensions/about-building-copilot-extensions) that exposes a set of developer-focused **skills** (tools) and a **custom agent** that users can @mention directly in Copilot Chat.

```
@plumberkit what time is it in Tokyo?
```

## Project Structure

```
PlumberKit/
├── .github/
│   └── workflows/
│       └── copilot-setup-steps.yml   # Copilot cloud agent setup
├── src/
│   ├── index.js                      # Express server entry point
│   ├── skills/
│   │   └── demo-skill.js             # Demo skill: get_current_time
│   └── agents/
│       └── demo-agent.js             # Demo custom agent: PlumberKit Assistant
├── .env.example                      # Example environment variables
└── package.json
```

## Getting Started

### Prerequisites

- Node.js ≥ 20
- A [GitHub App](https://docs.github.com/en/apps/creating-github-apps/about-creating-github-apps/about-creating-github-apps) registered with Copilot Extension capabilities

### Installation

```bash
npm install
```

### Configuration

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

| Variable               | Description                                                               | Default |
|------------------------|---------------------------------------------------------------------------|---------|
| `PORT`                 | HTTP port the server listens on                                           | `3000`  |
| `SKIP_SIGNATURE_CHECK` | Set to `true` to skip GitHub signature verification (dev only)            | `false` |

### Running the server

```bash
# Production
npm start

# Development (auto-restart on file changes)
npm run dev
```

## Skills

Skills are functions (tools) that the Copilot model can invoke during a conversation.

### `get_current_time` — demo-skill

Returns the current date and time, optionally in a given timezone.

**Parameters**

| Name       | Type   | Required | Description                                       |
|------------|--------|----------|---------------------------------------------------|
| `timezone` | string | No       | IANA timezone (e.g. `America/New_York`). Default: `UTC` |

**Example response**

```json
{
  "current_time": "Thursday, July 16, 2026 at 1:00:00 PM GMT+2",
  "iso": "2026-07-16T11:00:00.000Z",
  "timezone": "Europe/Rome"
}
```

### Adding a new skill

1. Create a new file in `src/skills/` (e.g. `src/skills/my-skill.js`).
2. Export a `*Definition` constant (OpenAI tool schema) and an `execute*` function.
3. Import the definition into `src/agents/demo-agent.js` and add it to the `TOOLS` array.
4. Add a case for it in `dispatchSkill`.

## Agents

Agents handle the full conversation lifecycle and decide which skills to invoke.

### `PlumberKit Assistant` — demo-agent

A general-purpose developer assistant that answers coding questions and can call any registered skill.

### Adding a new agent

1. Create a new file in `src/agents/` (e.g. `src/agents/my-agent.js`).
2. Export an async function with the signature `(payload, token, res) => Promise<void>`.
3. Register it as a route in `src/index.js`.

## Architecture

```
GitHub Copilot Chat
       │  POST /
       ▼
 Express Server (src/index.js)
       │  verifyAndParseRequest
       │  createAckEvent
       ▼
 Demo Agent (src/agents/demo-agent.js)
       │  fetch → Copilot API (gpt-4o, stream)
       │  detect tool_calls
       ▼
 Skill Dispatcher
       │  executeDemoSkill (src/skills/demo-skill.js)
       │  fetch → Copilot API (follow-up with tool result)
       ▼
 SSE text events → GitHub Copilot Chat
```

## License

MIT
