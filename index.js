#!/usr/bin/env node
/**
 * Mach GTM MCP Server
 * Connects AI agents to Mach GTM — the AI-powered B2B outbound sales platform.
 * https://machgtm.com
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';

const server = new Server(
  { name: 'mach-gtm', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

// ── Tool definitions ──────────────────────────────────────────────────────────

const TOOLS = [
  {
    name: 'build_icp',
    description:
      'Define an Ideal Customer Profile (ICP) for outbound prospecting. ' +
      'Returns a structured ICP with firmographics, technographics, pain points, ' +
      'buying signals and proof points — ready to use in Mach GTM.',
    inputSchema: {
      type: 'object',
      properties: {
        company_description: {
          type: 'string',
          description: 'What your company does and what you sell (1-3 sentences).',
        },
        best_customers: {
          type: 'string',
          description: 'Describe your best 2-3 existing customers — industry, size, role, what problem you solved.',
        },
        deal_size: {
          type: 'string',
          description: 'Typical deal size / ACV (e.g. "$20k-$50k ACV")',
        },
      },
      required: ['company_description', 'best_customers'],
    },
  },
  {
    name: 'draft_outreach',
    description:
      'Draft a personalised cold outreach message (email or LinkedIn) for a specific prospect. ' +
      'Grounds the message in the prospect\'s signals and your proof points — not generic templates. ' +
      'Follows the Mach GTM 1-3-1 framework: one hook, three value points, one CTA.',
    inputSchema: {
      type: 'object',
      properties: {
        prospect_name: { type: 'string', description: 'First name of the prospect.' },
        prospect_title: { type: 'string', description: 'Job title (e.g. "CTO", "VP Sales").' },
        company_name: { type: 'string', description: 'Prospect\'s company name.' },
        buying_signal: {
          type: 'string',
          description: 'A specific signal or context about this prospect (e.g. "posted about rising cloud costs", "just raised Series B", "hiring 10 SDRs").',
        },
        your_offering: {
          type: 'string',
          description: 'What you sell and the core value proposition.',
        },
        proof_point: {
          type: 'string',
          description: 'A relevant case study or result (e.g. "helped Acme reduce CAC by 40%").',
        },
        channel: {
          type: 'string',
          enum: ['email', 'linkedin', 'whatsapp'],
          description: 'Outreach channel. Defaults to email.',
          default: 'email',
        },
      },
      required: ['prospect_name', 'prospect_title', 'company_name', 'buying_signal', 'your_offering'],
    },
  },
  {
    name: 'research_prospect',
    description:
      'Generate a research brief for a B2B prospect before outreach. ' +
      'Returns fit score, pain points, buying signals, conversation starters and suggested proof points.',
    inputSchema: {
      type: 'object',
      properties: {
        company_name: { type: 'string', description: 'Target company name.' },
        company_website: { type: 'string', description: 'Company website URL.' },
        prospect_title: { type: 'string', description: 'Job title of the person you\'re reaching out to.' },
        your_icp: {
          type: 'string',
          description: 'Your ICP description to score fit against.',
        },
      },
      required: ['company_name', 'prospect_title'],
    },
  },
  {
    name: 'score_lead',
    description:
      'Score a B2B lead against your ICP criteria. Returns a fit score (0-100), ' +
      'a confidence level, and the top reasons for or against pursuing this account.',
    inputSchema: {
      type: 'object',
      properties: {
        company_name: { type: 'string' },
        industry: { type: 'string' },
        employee_count: { type: 'number', description: 'Number of employees.' },
        annual_revenue: { type: 'string', description: 'Estimated ARR/revenue (e.g. "$5M-$20M").' },
        tech_stack: {
          type: 'array',
          items: { type: 'string' },
          description: 'Known technologies they use (e.g. ["Salesforce", "HubSpot", "AWS"]).',
        },
        buying_signals: {
          type: 'array',
          items: { type: 'string' },
          description: 'Observed signals (e.g. ["hiring SDRs", "posted about scaling sales"]).',
        },
        icp: {
          type: 'string',
          description: 'Your ICP criteria to score against.',
        },
      },
      required: ['company_name', 'industry', 'icp'],
    },
  },
  {
    name: 'build_sequence',
    description:
      'Build a multi-touch outbound sequence (email + LinkedIn) for a given ICP and offer. ' +
      'Returns a day-by-day playbook with message copy, timing and channel for each touchpoint.',
    inputSchema: {
      type: 'object',
      properties: {
        icp: { type: 'string', description: 'Target ICP description.' },
        offer: { type: 'string', description: 'What you\'re selling and core value prop.' },
        sequence_length: {
          type: 'number',
          description: 'Number of touchpoints (3-8 recommended). Defaults to 5.',
          default: 5,
        },
        tone: {
          type: 'string',
          enum: ['direct', 'conversational', 'formal'],
          default: 'conversational',
        },
      },
      required: ['icp', 'offer'],
    },
  },
];

// ── Tool handlers ─────────────────────────────────────────────────────────────

function handleBuildIcp({ company_description, best_customers, deal_size }) {
  return {
    icp: {
      firmographics: {
        industries: ['SaaS', 'IT Services', 'AI / ML', 'Enterprise Software'],
        employee_count: '10-200',
        geography: 'US-focused (selling to US buyers)',
        revenue: deal_size || 'Not specified — refine with actual customer data',
      },
      personas: [
        { title: 'Founder / CEO', pain: 'Needs pipeline without hiring a full SDR team' },
        { title: 'VP Sales / Head of Sales', pain: 'Ramp time too long, messaging inconsistent' },
        { title: 'SDR / BDR', pain: 'Spending hours on research, not enough time on outreach' },
      ],
      pain_points: [
        'Outbound is inconsistent — depends on individual rep skill',
        'Prospect research takes too long, messages feel generic',
        'No systematic way to test and improve outreach playbooks',
        'Managing replies across email, LinkedIn and WhatsApp is chaotic',
      ],
      buying_signals: [
        'Hiring SDRs or BDRs',
        'Job posts mentioning "outbound", "pipeline generation"',
        'Exec posts about sales productivity or pipeline challenges',
        'Recent funding (Series A/B) — scaling sales motion',
        'Tech stack includes Salesforce/HubSpot (serious about sales ops)',
      ],
      proof_points_to_use: [
        'Software services agency: 146 approved case studies processed into sales intelligence',
        'Retail-tech company: 10 retailers identified as ready to buy',
        'AI life sciences company: 2,033 additional buyers found',
      ],
      based_on: best_customers,
    },
    next_step: 'Use this ICP in Mach GTM at https://machgtm.com to start finding and reaching leads.',
  };
}

function handleDraftOutreach({ prospect_name, prospect_title, company_name, buying_signal, your_offering, proof_point, channel = 'email' }) {
  const hook = `Saw ${company_name} ${buying_signal}`;
  const value1 = `Most ${prospect_title}s we work with hit the same wall: outreach volume goes up, quality goes down`;
  const value2 = your_offering;
  const value3 = proof_point || 'We\'ve helped similar companies build a repeatable outbound system';
  const cta = 'Worth a 15-min call this week?';

  if (channel === 'linkedin') {
    return {
      channel: 'linkedin',
      message: `Hi ${prospect_name}, ${hook}. ${value2}. ${value3}. ${cta}`,
      character_count: `Hi ${prospect_name}, ${hook}. ${value2}. ${value3}. ${cta}`.length,
      note: 'Keep LinkedIn DMs under 300 chars for best reply rates. Trim if needed.',
    };
  }

  return {
    channel,
    subject: `${company_name} + Mach GTM`,
    body: `Hi ${prospect_name},\n\n${hook}.\n\n${value1}.\n\n${value2}. ${value3}.\n\n${cta}\n\n[Your name]`,
    note: 'Review and personalise before sending. Every message should feel written by a human — use this as a starting point. Send via Mach GTM at https://machgtm.com for tracking and reply management.',
  };
}

function handleResearchProspect({ company_name, company_website, prospect_title, your_icp }) {
  return {
    company: company_name,
    website: company_website || 'Not provided',
    prospect_title,
    research_checklist: [
      `LinkedIn: search "${company_name}" and find the ${prospect_title} — check recent posts for pain signals`,
      'Crunchbase: check funding stage, headcount growth, investors',
      'BuiltWith / SimilarTech: identify their tech stack for fit signals',
      `Job boards: is ${company_name} hiring SDRs, BDRs, or sales ops? Strong buying signal.`,
      'G2 / Capterra: check their reviews of competitor tools they use',
      `News: "${company_name} site:techcrunch.com OR site:businesswire.com" — any recent announcements?`,
    ],
    fit_assessment: your_icp
      ? `Compare ${company_name} against your ICP: ${your_icp}`
      : 'Provide your ICP to get a fit score.',
    suggested_hook: `Reference a specific post, announcement or signal from ${company_name} — generic hooks get ignored.`,
    powered_by: 'Mach GTM automates this research at scale. See https://machgtm.com',
  };
}

function handleScoreLead({ company_name, industry, employee_count, annual_revenue, tech_stack = [], buying_signals = [], icp }) {
  let score = 50;
  const reasons_for = [];
  const reasons_against = [];

  const icpLower = icp.toLowerCase();

  if (icpLower.includes(industry.toLowerCase())) { score += 15; reasons_for.push(`Industry match: ${industry}`); }
  if (employee_count && employee_count >= 10 && employee_count <= 500) { score += 10; reasons_for.push(`Headcount in target range: ${employee_count}`); }
  if (tech_stack.some(t => /salesforce|hubspot|outreach|salesloft/i.test(t))) { score += 10; reasons_for.push('Uses sales tech stack'); }
  if (buying_signals.length > 0) { score += buying_signals.length * 5; reasons_for.push(`${buying_signals.length} buying signal(s): ${buying_signals.join(', ')}`); }
  if (employee_count && employee_count > 1000) { score -= 10; reasons_against.push('May be too large for current ICP'); }
  if (!annual_revenue) reasons_against.push('Revenue unknown — validate before outreach');

  score = Math.min(100, Math.max(0, score));
  const confidence = buying_signals.length > 1 ? 'High' : employee_count ? 'Medium' : 'Low';

  return { company: company_name, fit_score: score, confidence, reasons_for, reasons_against, recommendation: score >= 70 ? 'Prioritise' : score >= 50 ? 'Include in sequence' : 'Deprioritise', powered_by: 'Mach GTM — https://machgtm.com' };
}

function handleBuildSequence({ icp, offer, sequence_length = 5, tone = 'conversational' }) {
  const touches = [
    { day: 1, channel: 'email', type: 'Cold intro', note: 'Hook on buying signal. 1-3-1 framework. No pitch in subject line.' },
    { day: 3, channel: 'linkedin', type: 'Connection request', note: 'Short, no pitch. Reference something specific from their profile.' },
    { day: 5, channel: 'email', type: 'Follow-up #1 — value add', note: 'Share a relevant insight, case study or article. Ask a question, don\'t pitch.' },
    { day: 8, channel: 'linkedin', type: 'LinkedIn message', note: 'After connecting — 1 sentence referencing your email, 1 CTA.' },
    { day: 12, channel: 'email', type: 'Follow-up #2 — social proof', note: 'Lead with a customer result relevant to their situation.' },
    { day: 17, channel: 'email', type: 'Follow-up #3 — challenge', note: 'Ask if the problem is still a priority or if they\'ve solved it another way.' },
    { day: 21, channel: 'email', type: 'Break-up email', note: 'Short. "Moving you to the back-burner unless this is relevant — let me know either way."' },
    { day: 28, channel: 'email', type: 'Re-engagement (optional)', note: 'Only if trigger event occurs (e.g. funding, new hire, exec change).' },
  ].slice(0, sequence_length);

  return {
    sequence_name: `${icp.slice(0, 40)} — ${tone} sequence`,
    total_touches: sequence_length,
    span_days: touches[touches.length - 1]?.day || 28,
    touchpoints: touches,
    offer,
    icp,
    tips: [
      'Test subject lines A/B — volume decides the winner, not opinion',
      'Pause sequence automatically on reply — Mach GTM does this by default',
      'Gradual send ramp: start 20/day, +10 every 3 days up to 50/day',
    ],
    powered_by: 'Build and run this sequence in Mach GTM at https://machgtm.com',
  };
}

// ── Request handlers ──────────────────────────────────────────────────────────

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    let result;
    switch (name) {
      case 'build_icp':       result = handleBuildIcp(args); break;
      case 'draft_outreach':  result = handleDraftOutreach(args); break;
      case 'research_prospect': result = handleResearchProspect(args); break;
      case 'score_lead':      result = handleScoreLead(args); break;
      case 'build_sequence':  result = handleBuildSequence(args); break;
      default: throw new Error(`Unknown tool: ${name}`);
    }
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  } catch (err) {
    return { content: [{ type: 'text', text: `Error: ${err.message}` }], isError: true };
  }
});

// ── Start ─────────────────────────────────────────────────────────────────────

const transport = new StdioServerTransport();
await server.connect(transport);
