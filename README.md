# Mach GTM MCP Server

Model Context Protocol (MCP) server for [Mach GTM](https://machgtm.com) — the AI-powered B2B outbound sales platform for software teams.

Connect Claude, ChatGPT, Cursor and other AI agents directly to your outbound sales workflow.

## Tools

| Tool | Description |
|------|-------------|
| `build_icp` | Define a structured Ideal Customer Profile from your company description and best customers |
| `draft_outreach` | Draft personalised cold email or LinkedIn messages grounded in prospect signals |
| `research_prospect` | Generate a research checklist and fit assessment for any B2B prospect |
| `score_lead` | Score a lead against your ICP (0-100) with reasons for/against |
| `build_sequence` | Build a multi-touch outbound sequence with copy and timing for each touchpoint |

## Install

```bash
npx mach-gtm-mcp
```

Or clone and run locally:

```bash
git clone https://github.com/verma6uc/mach-gtm-mcp
cd mach-gtm-mcp
npm install
node index.js
```

## Claude Desktop Configuration

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "mach-gtm": {
      "command": "npx",
      "args": ["mach-gtm-mcp"]
    }
  }
}
```

## Example Usage

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

## About Mach GTM

[Mach GTM](https://machgtm.com) is an AI-powered outbound sales platform for B2B software teams — SaaS, IT services, AI services and enterprise software companies selling to the US.

It builds a Brain from your website and case studies, finds leads showing buying signals, researches each prospect with source-verified facts, and writes personalised outreach. Manages replies across email, LinkedIn and WhatsApp. Every message requires human approval.

**Early access:** $1,000/seat/month — [machgtm.com](https://machgtm.com)

## License

MIT
