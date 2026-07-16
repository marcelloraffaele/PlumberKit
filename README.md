# PlumberKit

![PlumberKit logo](doc/images/logo.png)

PlumberKit is a GitHub Copilot Marketplace that contains many useful (plugins) tools for developers. Contains Agents, skills and MCP Server tested and ready to use.

> I know this Marketplace is not the most complete you have seen in your life, but it is a good starting point to create your own plugins and share them with the community. I have created it to learn how to create plugins and share them with the community. I hope you enjoy it and if you want to contribute, please do it. I will be happy to review your pull requests and merge them.

## Plugins

### Template code generator
Agents and skills to generate code templates for different programming languages.

| Plugin | Type | Name | What it provides |
| --- | --- | --- | --- |
| Template code generator | Agent | [`generate-crud-component`](template-code-generator/agents/generate-crud-component.agent.md) | Generates the files needed for a Java CRUD API component, including a bean, controller, and service. |
| Template code generator | Skill | [`generate-csharp-pattern1`](template-code-generator/skills/generate-csharp-pattern1/SKILL.md) | Generates a C# component, service, and controller using the Pattern1 template. |

### Quality
Agents and skills to analyze code quality, detect bugs, and suggest improvements.

| Plugin | Type | Name | What it provides |
| --- | --- | --- | --- |
| Quality | Agent | [`AI-Ready`](quality/agents/ai-ready.agent.md) | Reviews project structure for AI-ready GitHub Copilot setup and can generate compatible code snippets and components. |
| Quality | Skill | [`secure-api`](quality/skills/secure-api/SKILL.md) | Reviews and improves REST API security, including authentication, authorization, input validation, rate limiting, monitoring, and OWASP Top 10 checks. |


## How to install

Register the additional marketplace:
```bash
# to add the marketplace
copilot plugin marketplace add marcelloraffaele/PlumberKit
```

To check the plugins available in the marketplace you can use:
```bash
# to list the plugins
copilot plugin marketplace browse plumberkit
```


Add the plugins you want to use:
```bash
# to add the plugins
copilot plugin install template-code-generator@plumberkit
copilot plugin install quality@plumberkit
```

To clean up the plugins you can use:
```bash
# to remove the plugins
copilot plugin uninstall template-code-generator@plumberkit
copilot plugin uninstall quality@plumberkit

# to remove the marketplace
copilot plugin marketplace remove plumberkit
```