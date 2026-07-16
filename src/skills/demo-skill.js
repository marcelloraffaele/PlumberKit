/**
 * Demo Skill: get_current_time
 *
 * A simple skill that returns the current date and time.
 * This serves as an example of how to define and implement
 * a skill (tool) in a GitHub Copilot Extension.
 */

/**
 * OpenAI-compatible tool definition for this skill.
 * This is the schema sent to the model so it knows when and how to invoke it.
 */
export const demoSkillDefinition = {
  type: "function",
  function: {
    name: "get_current_time",
    description:
      "Returns the current date and time. Use this when the user asks what time or date it is, or needs a timestamp.",
    parameters: {
      type: "object",
      properties: {
        timezone: {
          type: "string",
          description:
            "IANA timezone name (e.g. 'America/New_York', 'Europe/Rome'). Defaults to UTC when omitted.",
        },
      },
      required: [],
    },
  },
};

/**
 * Executes the get_current_time skill.
 *
 * @param {object} args - Arguments provided by the model.
 * @param {string} [args.timezone] - IANA timezone name.
 * @returns {{ current_time: string, iso: string, timezone: string }}
 */
export function executeDemoSkill(args) {
  const { timezone = "UTC" } = args;
  const now = new Date();

  let formatted;
  try {
    formatted = now.toLocaleString("en-US", {
      timeZone: timezone,
      dateStyle: "full",
      timeStyle: "long",
    });
  } catch {
    // Fall back to UTC when an unknown timezone is supplied
    formatted = now.toLocaleString("en-US", {
      timeZone: "UTC",
      dateStyle: "full",
      timeStyle: "long",
    });
  }

  return {
    current_time: formatted,
    iso: now.toISOString(),
    timezone,
  };
}
