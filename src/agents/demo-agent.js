/**
 * Demo Agent: PlumberKit Assistant
 *
 * A custom Copilot agent that demonstrates how to build an @-mentionable
 * GitHub Copilot Extension.  It answers developer questions and can invoke
 * skills (tools) when needed.
 *
 * The agent:
 *  1. Prepends a system prompt to the conversation.
 *  2. Forwards the messages to the GitHub Copilot proxy API with the
 *     registered skills as tools.
 *  3. Streams text deltas back to the client via Server-Sent Events (SSE).
 *  4. Handles tool-call responses by executing the matching skill server-side
 *     and resuming the conversation with the result.
 */

import { createTextEvent } from "@copilot-extensions/preview-sdk";
import { demoSkillDefinition, executeDemoSkill } from "../skills/demo-skill.js";

const COPILOT_API_URL = "https://api.githubcopilot.com/chat/completions";
const MODEL = "gpt-4o";

const SYSTEM_PROMPT = `You are PlumberKit, a helpful developer assistant powered by GitHub Copilot.
You help developers with coding questions, debugging, code reviews, and general software engineering tasks.
You have access to tools that can provide real-time information to enhance your responses.
Always be concise, accurate, and developer-friendly.`;

/** All skills available to this agent */
const TOOLS = [demoSkillDefinition];

/**
 * Dispatches a tool call to the matching skill executor.
 *
 * @param {string} name - Tool name.
 * @param {object} args - Parsed arguments.
 * @returns {unknown} Skill result (will be JSON-stringified before sending).
 */
function dispatchSkill(name, args) {
  switch (name) {
    case "get_current_time":
      return executeDemoSkill(args);
    default:
      return { error: `Unknown skill: ${name}` };
  }
}

/**
 * Streams a chat-completion response from the Copilot API, forwarding text
 * deltas to `res` and collecting any tool-call chunks into a single object.
 *
 * @param {Array<object>} messages - OpenAI-compatible message array.
 * @param {string} token - GitHub user token forwarded from the request.
 * @param {import("express").Response} res - HTTP response used as SSE stream.
 * @param {Array<object>} [tools] - Optional tool definitions; omitted on follow-up calls.
 * @returns {Promise<object|null>} Resolved tool call (id, name, arguments) or null.
 */
async function streamCompletion(messages, token, res, tools) {
  const body = { model: MODEL, stream: true, messages };
  if (tools && tools.length > 0) body.tools = tools;

  const response = await fetch(COPILOT_API_URL, {
    method: "POST",
    headers: {
      Authorization: "Bearer " + token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(
      `Copilot API error: ${response.status} ${response.statusText}`
    );
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let pendingToolCall = null;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? ""; // keep any incomplete line for the next iteration

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const data = line.slice(6).trim();
      if (data === "[DONE]") continue;

      let chunk;
      try {
        chunk = JSON.parse(data);
      } catch {
        continue;
      }

      const choice = chunk.choices?.[0];
      if (!choice) continue;

      const delta = choice.delta ?? {};

      // Stream text back to the caller
      if (delta.content) {
        res.write(createTextEvent(delta.content));
      }

      // Accumulate tool-call fragments (streamed across multiple chunks)
      if (delta.tool_calls) {
        for (const tc of delta.tool_calls) {
          if (!pendingToolCall) {
            pendingToolCall = {
              id: tc.id ?? "",
              name: tc.function?.name ?? "",
              arguments: "",
            };
          }
          if (tc.function?.arguments) {
            pendingToolCall.arguments += tc.function.arguments;
          }
          if (tc.id) pendingToolCall.id = tc.id;
          if (tc.function?.name) pendingToolCall.name = tc.function.name;
        }
      }

      if (choice.finish_reason === "tool_calls") {
        return pendingToolCall;
      }
    }
  }

  return null;
}

/**
 * Main agent entry point.  Called by the Express route handler after the
 * request has been verified and parsed.
 *
 * @param {import("@copilot-extensions/preview-sdk").CopilotRequestPayload} payload
 * @param {string} token - GitHub user token from the `X-GitHub-Token` header.
 * @param {import("express").Response} res - Active SSE response stream.
 */
export async function demoAgent(payload, token, res) {
  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...payload.messages,
  ];

  // First completion pass — may return a tool call
  const toolCall = await streamCompletion(messages, token, res, TOOLS);

  if (!toolCall) return; // No tool call; we're done

  // Parse arguments safely
  let args = {};
  try {
    args = JSON.parse(toolCall.arguments || "{}");
  } catch {
    args = {};
  }

  // Execute the skill server-side
  const result = dispatchSkill(toolCall.name, args);

  // Second completion pass — generate the final answer with the tool result
  const followUpMessages = [
    ...messages,
    {
      role: "assistant",
      tool_calls: [
        {
          id: toolCall.id,
          type: "function",
          function: { name: toolCall.name, arguments: JSON.stringify(args) },
        },
      ],
    },
    {
      role: "tool",
      tool_call_id: toolCall.id,
      content: JSON.stringify(result),
    },
  ];

  await streamCompletion(followUpMessages, token, res);
}
