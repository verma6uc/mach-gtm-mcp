# Mach GTM MCP Server

A small, free Model Context Protocol (MCP) server with five outbound sales helpers. It runs inside Claude Desktop, Claude Code, Cursor and other MCP clients.

It is a starter kit from the team behind [Mach](https://machgtm.com). The tools shape what you give them into an ICP, a message, a research checklist, a lead score or a sequence. They do not search the web or look anything up, so every fact in the output is one you supplied.

## Tools

| Tool | What it does |
|------|-------------|
| `build_icp` | Turns your company description and best customers into a structured Ideal Customer Profile |
| `draft_outreach` | Drafts a cold email or LinkedIn message from a buying signal and a proof point you provide |
| `research_prospect` | Gives a research checklist and the questions to answer before you reach out |
| `score_lead` | Scores a lead 0-100 against your ICP with a simple, readable formula, plus reasons for and against |
| `build_sequence` | Lays out a multi-touch sequence with timing for each step |

## Install

Run it straight from GitHub (needs Node.js 18 or later):

```bash
npx -y github:verma6uc/mach-gtm-mcp
```

Or clone and run locally:

```bash
git clone https://github.com/verma6uc/mach-gtm-mcp
cd mach-gtm-mcp
npm install
node index.js
```

## Claude Desktop configuration

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "mach-gtm": {
      "command": "npx",
      "args": ["-y", "github:verma6uc/mach-gtm-mcp"]
    }
  }
}
```

## Claude Code

```bash
claude mcp add mach-gtm -- npx -y github:verma6uc/mach-gtm-mcp
```

## Example usage

The companies and results below are made up.

**Build an ICP:**
```
Use the build_icp tool.
company_description: "We sell AI-powered code review tools to engineering teams"
best_customers: "Series B SaaS companies with 20-100 engineers, CTOs worried about code quality at scale"
deal_size: "$30k-$80k ACV"
```

**Draft outreach:**
```
Use draft_outreach.
prospect_name: "Sarah"
prospect_title: "VP Engineering"
company_name: "Acme Corp"
buying_signal: "posted about struggling to maintain code quality while scaling the team"
your_offering: "AI code review that catches issues before they hit production"
proof_point: "helped DataCo reduce production bugs by 60% in 90 days"
```

Read every draft before you send it, and check that each fact in it is true.

## What this server does not do

- It does not find leads, research companies or verify facts.
- It does not send email or LinkedIn messages.
- It does not connect to a Mach account.

## About Mach

[Mach](https://machgtm.com) is an outbound sales workspace for small B2B software and services teams selling to the US. It reads your website and case studies to learn what you sell, researches accounts and people with a source for every fact, and drafts messages a person approves before anything is sent. Email, LinkedIn and WhatsApp replies land in one inbox by company.

Mach is in early access: [machgtm.com](https://machgtm.com).

## License

MIT
