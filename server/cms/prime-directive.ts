/**
 * PRIME DIRECTIVE
 *
 * The canonical, code-owned content that defines what Generativ Consulting Company
 * sells and how it talks about it:
 *
 *   The AI Opportunity Audit — flat $500, 5 business days, on-site.
 *   We map the top 3 operational leaks with quantified savings.
 *   If we don't find at least $5,000 in verifiable annual savings, we refund the $500.
 *   If we build, the $500 is credited 100% toward the implementation.
 *
 * Everything else on the site — pages, services, blog — is arranged to support that offer.
 *
 * This module is an IDEMPOTENT upsert-by-slug. Running it twice is a no-op beyond
 * refreshing `updatedAt`; it never duplicates a page, service, or post. The LMDB
 * database is not distributable through git (it is a live, server-local file), so
 * this is how canonical content reaches production: pull the code, run the sync.
 *
 *   cd server && bun run index.ts --sync-content
 *   cd server && SYNC_CONTENT=true bun run start
 */

import {
  getAllPages,
  getAllServices,
  getAllBlogPosts,
  createPage,
  updatePage,
  createService,
  updateService,
  createBlogPost,
  updateBlogPost,
  getSiteSettings,
  saveSiteSettings
} from './db.js';
import type { Page, Service, BlogPost, SiteSettings } from './schema';

type PageSeed = Omit<Page, 'id' | 'createdAt' | 'updatedAt'>;
type ServiceSeed = Omit<Service, 'id' | 'createdAt' | 'updatedAt'>;
type BlogSeed = Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>;

// ---------------------------------------------------------------------------
// The offer, stated once, reused everywhere.
// ---------------------------------------------------------------------------

export const PRIME_DIRECTIVE = {
  offer: 'AI Opportunity Audit',
  price: '$500 flat fee',
  duration: '5 business days',
  guarantee:
    "If the audit does not identify at least $5,000 in verifiable annual savings, we refund the $500. If you build with us, the $500 is credited 100% toward the implementation.",
  promise: 'Find the leak. Prove the savings. Ship the agent.'
};

const AUDIT_CTA = { text: 'Book the $500 Audit', url: '/contact' };

// The measured factors behind the offer. Sourced from the 2026 Uptown NYC
// engagement research; each figure is attributed where it is rendered.
const LEAK_STATS = [
  {
    value: '42%',
    label: 'of local businesses lose money to missed calls',
    detail: 'Over $500 a month walks out the door on calls nobody picked up.'
  },
  {
    value: '$12–$20',
    label: 'labor cost per manually processed form',
    detail: 'Manual document processing runs 10–30 minutes per file.'
  },
  {
    value: '12 min',
    label: 'industry-standard first response to an inbound lead',
    detail: 'Automated matching answers in 12 seconds — before the competitor does.'
  },
  {
    value: '85%',
    label: 'of failed AI projects trace back to data quality',
    detail: 'Not the model. The spreadsheets, the duplicates, the unreconciled records.'
  }
];

const IMPACT_STATS = [
  {
    value: '5 hrs/wk',
    label: 'saved per doctor',
    detail: 'Multi-channel scheduling and pre-appointment agents, medical and dental.'
  },
  {
    value: '8–12 hrs/wk',
    label: 'reclaimed for front-desk staff',
    detail: 'Automated patient and client intake across clinics and brokerages.'
  },
  {
    value: '$2.36',
    label: 'new cost per form entry',
    detail: 'Down from $12–$20 with document intelligence — an ~80% reduction.'
  },
  {
    value: '14–15%',
    label: 'average staff productivity gain',
    detail: 'What happens when the repetitive work stops reaching human hands.'
  }
];

const VERTICALS = [
  {
    icon: '🏠',
    title: 'Real Estate & Property Management',
    leak: 'The speed-to-lead gap. Inquiries that arrive after hours or on weekends go cold.',
    before: 'Hours of manual sorting; 12-minute average first response',
    after: 'Qualified and routed in under 60 seconds — a 12-second first touch',
    proof: 'Payback in 2 to 3 weeks for teams with steady inbound.'
  },
  {
    icon: '🦷',
    title: 'Dental & Medical Clinics',
    leak: 'No-shows and manual intake. Staff lose 8–15 hours a week to phone tag and retyping forms.',
    before: 'Constant phone tag, paper intake retyped into the EHR',
    after: 'Instant patient booking, validated intake, automatic reminders',
    proof: 'Over 5 hours back per doctor per week; 20%+ lift in patient engagement.'
  },
  {
    icon: '⚖️',
    title: 'Law & Tax Offices',
    leak: 'Document processing. The same standard fields, extracted by hand, at $12–$20 a form.',
    before: 'Manual review of contracts, referral packets and tax documents',
    after: 'Secure extraction in 1–2 seconds with human-in-the-loop approval gates',
    proof: 'Built for AI-disclosure regimes such as the 15th Judicial Circuit AO 2.109-4/26.'
  }
];

const OFFER_LADDER = [
  {
    name: 'The Gateway: AI Opportunity Audit',
    price: '$500 flat',
    timeline: '5 business days',
    objective:
      'Map three high-ROI operational leaks with quantified savings. Fully credited toward the build.'
  },
  {
    name: 'The Hook: Quick-Win Sprint',
    price: '$1,500 – $3,500',
    timeline: '7 to 14 days',
    objective:
      'Deploy one automated system end to end — lead capture, intake, or document extraction — wired into the tools you already use.'
  },
  {
    name: 'The Scale-Up: Managed Operations',
    price: '$1,500 – $5,000 / month',
    timeline: 'Ongoing partnership',
    objective:
      'Continuous monitoring, model versioning, retraining and retrieval-pipeline tuning so the agents survive the next model shift.'
  }
];

const FIVE_DAY_SCHEDULE = [
  {
    title: 'Day 1 — Discovery',
    description:
      'Workflow walks and tool inventory, on-site, with the owner-operator present. We watch the work actually move.'
  },
  {
    title: 'Day 2 — Analysis',
    description:
      'Bottleneck scoring and internal logic review. Where does a task stop and wait for a human who is busy?'
  },
  {
    title: 'Day 3 — Sizing',
    description:
      'ROI opportunity sizing and cost projections, using standard labor and time assumptions you can check yourself.'
  },
  {
    title: 'Day 4 — Strategy',
    description:
      'Drafting the 90-day roadmap: what ships first, what it plugs into, and what it is measured against.'
  },
  {
    title: 'Day 5 — Delivery',
    description:
      'Delivery of the Readiness Score, the top 3 bottlenecks, and the roadmap — in writing, with the math shown.'
  }
];

const FIVE_TESTS = [
  {
    icon: '🔁',
    title: 'Orchestration',
    description:
      'Beyond a single model call: planning loops, retries, and state that survives a failure mid-task.'
  },
  {
    icon: '🛡️',
    title: 'Governance',
    description:
      'PII handling and evaluation pipelines that survive a professional audit cycle, not just a demo.'
  },
  {
    icon: '🔌',
    title: 'Integration',
    description:
      'Agents wired into your actual CRM, EHR or order pipeline — the connector layer most setups are missing.'
  },
  {
    icon: '🔎',
    title: 'Observability',
    description:
      'Every non-deterministic decision traceable back to the specific inputs that produced it.'
  },
  {
    icon: '🎯',
    title: 'Outcomes',
    description:
      'Success denominated in resolution time and revenue uplift — never in "agents shipped".'
  }
];

// ---------------------------------------------------------------------------
// Pages
// ---------------------------------------------------------------------------

const homePage: PageSeed = {
  slug: 'home',
  title: 'Generativ Consulting Company',
  content: '',
  template: 'home',
  isPublished: true,
  publishedAt: new Date().toISOString(),
  sections: [
    {
      id: 'hero',
      type: 'hero',
      title: 'Find the Leak. Prove the Savings. Ship the Agent.',
      content:
        'A flat $500, five-day AI Opportunity Audit that maps the three operational leaks costing you the most — with the math written down. If we cannot find $5,000 in annual savings, you get the $500 back.',
      sortOrder: 1,
      settings: {
        ctaPrimary: AUDIT_CTA,
        ctaSecondary: { text: 'See How the Audit Works', url: '/services/ai-opportunity-audit' }
      }
    },
    {
      id: 'silent-leak',
      type: 'content',
      title: 'The Silent Leak',
      content:
        '<p>Nothing on your P&amp;L is labelled "invisible overhead". It shows up as a call nobody returned, a form retyped for the third time, a renter who booked with someone faster. The money leaves quietly, every week, in amounts too small to trigger an alarm.</p>',
      sortOrder: 2,
      settings: {
        stats: LEAK_STATS,
        statsNote:
          'Figures from 2026 small-business automation research; data-quality figure from published AI project post-mortems.'
      }
    },
    {
      id: 'services-overview',
      type: 'services',
      title: 'How We Work',
      content:
        'One low-friction way in, two ways forward. Every engagement starts with the audit.',
      sortOrder: 3,
      settings: {}
    },
    {
      id: 'verticals',
      type: 'content',
      title: 'Three Leaks We Close Every Week',
      content:
        '<p>General AI advice is a liability. These are the specific failure paths we have measured in real estate, clinical, and legal storefront operations — and what closing them looks like.</p>',
      sortOrder: 4,
      settings: { verticals: VERTICALS }
    },
    {
      id: 'offer-ladder',
      type: 'content',
      title: 'The Path to Production',
      content:
        '<p>Discovery, then deployment, then keeping it alive. Fixed prices at every step, and no hourly meter anywhere.</p>',
      sortOrder: 5,
      settings: {
        tiers: OFFER_LADDER,
        ctaText: 'Start with the audit',
        ctaUrl: '/services/ai-opportunity-audit'
      }
    },
    {
      id: 'five-day',
      type: 'content',
      title: 'The 5-Day Precision Delivery Schedule',
      content:
        '<p>An owner-operator cannot disappear into a discovery phase. We go from tool inventory to ROI sizing in a single business week.</p>',
      sortOrder: 6,
      settings: { steps: FIVE_DAY_SCHEDULE }
    },
    {
      id: 'impact',
      type: 'content',
      title: 'Real Local Impact',
      content:
        '<p>What the reclaimed hours look like once the repetitive work stops reaching human hands.</p>',
      sortOrder: 7,
      settings: { stats: IMPACT_STATS }
    },
    {
      id: 'value-prop',
      type: 'content',
      title: 'Why the Audit Comes First',
      content:
        '<p>Over 40% of agentic AI projects are expected to be cancelled by the end of 2027 (Gartner). Almost none of those failures are caused by the models. They are caused by escalating cost, unclear business value, and missing risk controls in non-deterministic systems. The audit exists to catch exactly that, before you spend anything on a build.</p>',
      sortOrder: 8,
      settings: {
        valuePoints: [
          {
            title: 'Quantified, not aspirational',
            description:
              'Every opportunity is scored by feasibility and return, with labor and time assumptions you can verify yourself.'
          },
          {
            title: 'Observational, not invasive',
            description:
              'We do not copy, duplicate or store your customer records. NDA signed before day one; your data never leaves your premises.'
          },
          {
            title: 'Human-in-the-loop by default',
            description:
              'Critical actions are drafted, queued and held until a person approves them. That is a compliance requirement, not a feature toggle.'
          }
        ],
        ctaText: 'The discipline behind the audit',
        ctaUrl: '/about'
      }
    },
    {
      id: 'team-overview',
      type: 'team',
      title: 'Who Runs the Audit',
      content: 'Twenty-five years of software leadership, pointed at your front desk.',
      sortOrder: 9,
      settings: { showMembers: 3, ctaText: 'Meet the Full Team', ctaUrl: '/team' }
    },
    {
      id: 'home-cta',
      type: 'cta',
      title: 'Identify Your $5,000 in Savings',
      content:
        'Book a 30-minute discovery session to start the five-day schedule. Flat $500, credited to your build — or refunded if the numbers are not there.',
      sortOrder: 10,
      settings: {
        ctaPrimary: AUDIT_CTA,
        ctaSecondary: { text: 'Read the Leak Diagnostics', url: '/blog' }
      }
    }
  ],
  seo: {
    title: 'AI Opportunity Audit — $500, 5 Days | Generativ Consulting Company',
    description:
      'A flat $500, five-day AI Opportunity Audit that maps your top three operational leaks with quantified savings. Backed by a $5,000 ROI guarantee.',
    keywords: [
      'AI opportunity audit',
      'small business automation',
      'speed to lead',
      'document intelligence',
      'agentic AI',
      'AI consulting'
    ]
  }
};

const aboutPage: PageSeed = {
  slug: 'about',
  title: 'About Generativ Consulting Company',
  content: '',
  template: 'about',
  isPublished: true,
  publishedAt: new Date().toISOString(),
  sections: [
    {
      id: 'about-hero',
      type: 'hero',
      title: 'Audit-Grade, Not Boardroom-Grade',
      content:
        'We build automated pipelines that run in the background and handle the repetitive work. We do not sell generic software, and we do not write strategy decks.',
      sortOrder: 1,
      settings: {}
    },
    {
      id: 'about-mission',
      type: 'content',
      title: 'Our Mission',
      content:
        '<p>Generativ Consulting Company exists to close the gap between what AI is said to do and what it actually does inside a working business. We start every relationship the same way: a flat $500, five-day AI Opportunity Audit that names the three leaks costing you the most and shows the arithmetic behind each one.</p><p>Our deeper practice — safety testing, parallelization, and critical-thinking education — is the capability that makes the audit trustworthy. It is not a separate menu. It is why the roadmap survives contact with production.</p>',
      sortOrder: 2,
      settings: {}
    },
    {
      id: 'about-five-tests',
      type: 'content',
      title: 'The 5 Tests of Audit-Grade Discipline',
      content:
        '<p>To separate real agentic potential from vendor noise, every opportunity we score has to pass five tests. An agent is not a single prompt call wrapped in a UI.</p>',
      sortOrder: 3,
      settings: { values: FIVE_TESTS }
    },
    {
      id: 'about-market',
      type: 'content',
      title: 'The Reality of Agentic AI in 2026',
      content:
        '<p>The landscape is a jarring disconnect between boardroom hype and the architectural reality of storefront operations. Both things are true at once: adoption is accelerating hard, and most projects still fail.</p>',
      sortOrder: 4,
      settings: {
        stats: [
          {
            value: '40%+',
            label: 'of agentic AI projects expected to be cancelled by end of 2027',
            detail: 'Gartner — driven by cost, unclear value, and inadequate risk controls.'
          },
          {
            value: '<5% → 40%',
            label: 'enterprise apps with task-specific AI agents, 2025 to end of 2026',
            detail: 'Gartner.'
          },
          {
            value: '23% / 39%',
            label: 'of organizations already scaling agentic systems / actively experimenting',
            detail: 'McKinsey.'
          },
          {
            value: '15%',
            label: 'of day-to-day work decisions made autonomously by 2028',
            detail: 'Up from 0% in 2024.'
          }
        ]
      }
    },
    {
      id: 'about-approach',
      type: 'content',
      title: 'Our Approach',
      content:
        '<p>The audit is a compressed, high-impact week. We require the owner-operator present on Day 1 — the diagnostic only works if it captures the scars of your specific operation.</p>',
      sortOrder: 5,
      settings: { steps: FIVE_DAY_SCHEDULE }
    },
    {
      id: 'about-values',
      type: 'content',
      title: 'Our Core Values',
      content: '<p>What holds regardless of which engine is underneath.</p>',
      sortOrder: 6,
      settings: {
        values: [
          {
            title: 'Rigor',
            description:
              'If we cannot measure the hours or the cash saved, we do not build it. Every claim gets its arithmetic shown.',
            icon: '🔍'
          },
          {
            title: 'Discretion',
            description:
              'Audits are observational. NDA from day one, no copy-access to your files, and your data never used to train public models.',
            icon: '🔒'
          },
          {
            title: 'Partnership',
            description:
              'Agents support the team behind the work. We automate the tedium and hand the reclaimed hours back to your staff.',
            icon: '🤝'
          },
          {
            title: 'Education',
            description:
              'Two-week handover with runbooks and video training. You should not need us on retainer to keep the lights on.',
            icon: '🧠'
          }
        ]
      }
    },
    {
      id: 'about-cta',
      type: 'cta',
      title: 'Start With the Diagnosis',
      content:
        'Thirty-minute discovery session, then the five-day schedule. Flat $500, backed by the $5,000 ROI guarantee.',
      sortOrder: 7,
      settings: {
        ctaPrimary: AUDIT_CTA,
        ctaSecondary: { text: 'See the Offer Ladder', url: '/services' }
      }
    }
  ],
  seo: {
    title: 'About | Audit-Grade AI for Working Businesses | Generativ Consulting',
    description:
      'The 5 Tests of Audit-Grade Discipline, the 5-day delivery schedule, and why over 40% of agentic AI projects are expected to be cancelled by 2027.',
    keywords: ['about', 'agentic AI', 'AI governance', 'AI observability', 'audit-grade AI']
  }
};

// ---------------------------------------------------------------------------
// Services — the offer ladder first, the underlying capability behind it.
// ---------------------------------------------------------------------------

const services: ServiceSeed[] = [
  {
    slug: 'ai-opportunity-audit',
    title: 'AI Opportunity Audit',
    shortDescription:
      'Flat $500. Five business days. Your top three operational leaks, quantified in writing — or your money back.',
    fullDescription: `
<p>The Audit is the way in. For a flat <strong>$500</strong> we spend <strong>five business days</strong> mapping how work actually moves through your operation, then hand you a written roadmap ranking the three bottlenecks costing you the most.</p>

<h3>What you receive</h3>
<ul>
  <li><strong>The Readiness Score:</strong> a technical assessment of your infrastructure, data quality, and team capability.</li>
  <li><strong>The Top 3 Bottlenecks:</strong> a diagnostic of the three failure paths currently burning the most manual labor, each with its annual cost.</li>
  <li><strong>The 90-Day ROI Roadmap:</strong> a tactical deployment plan against measurable financial targets — what ships first, what it plugs into, how it is measured.</li>
</ul>

<h3>The five-day schedule</h3>
<ol>
  <li><strong>Day 1 — Discovery:</strong> workflow walks and tool inventory, on-site, with you present.</li>
  <li><strong>Day 2 — Analysis:</strong> bottleneck scoring and internal logic review.</li>
  <li><strong>Day 3 — Sizing:</strong> ROI opportunity sizing and cost projections.</li>
  <li><strong>Day 4 — Strategy:</strong> drafting the 90-day roadmap.</li>
  <li><strong>Day 5 — Delivery:</strong> Readiness Score and final roadmap, in writing.</li>
</ol>

<h3>The two-way guarantee</h3>
<p>If we identify more than $5,000 in verifiable annual savings and you build with us, <strong>100% of the $500 is credited</strong> toward your Quick-Win Sprint. If we fail to identify at least $5,000 in verifiable annual savings — denominated in resolution time and revenue uplift — you get a <strong>100% refund</strong>.</p>

<h3>How we handle your data</h3>
<p>The audit is purely observational. We do not duplicate, store or copy live customer records or transaction databases. NDA is signed before Day 1, and every conversation, metric and process is covered by it.</p>
    `,
    icon: '🔎',
    benefits: [
      'Flat $500 — no hourly meter, no obligation to build',
      'Written roadmap with three quantified opportunities in five business days',
      '$5,000 annual-savings guarantee, or a full refund',
      '100% credited toward implementation if you proceed',
      'Observational only — NDA signed before day one'
    ],
    pricing: '$500 flat fee (up to $3,500 for complex multi-site operations)',
    isPublished: true,
    sortOrder: 1,
    seo: {
      title: 'AI Opportunity Audit — $500, 5 Days | Generativ Consulting Company',
      description:
        'Flat $500, five-day on-site AI Opportunity Audit. Top three operational leaks quantified in writing, backed by a $5,000 annual-savings guarantee.',
      keywords: ['AI audit', 'AI opportunity audit', 'automation assessment', 'ROI guarantee']
    }
  },
  {
    slug: 'quick-win-sprint',
    title: 'Quick-Win Automation Sprint',
    shortDescription:
      'One automated system, shipped end to end in 7 to 14 days, wired into the tools your team already uses.',
    fullDescription: `
<p>The Sprint turns the first item on your roadmap into a working system. Fixed price, fixed scope, shipped in days rather than quarters.</p>

<h3>What a sprint typically ships</h3>
<ul>
  <li><strong>Speed-to-Lead intake (real estate):</strong> a 24/7 agent that monitors listing portals and web forms, qualifies move-in date and budget, and books straight onto an agent's calendar. Target: first response from 12 minutes to under 60 seconds. <em>~$1,500, 7 to 10 days.</em></li>
  <li><strong>Clinical intake &amp; scheduling (medical/dental):</strong> mobile intake forms texted to patients, validated and auto-populated, plus a text-based appointment manager. Target: 8 to 12 staff hours back per week and a sharp drop in no-shows. <em>~$2,500, 10 to 14 days, HIPAA-ready.</em></li>
  <li><strong>Secure document intelligence (law/tax):</strong> a pipeline that parses client packets and case files, extracts the standard fields, and drafts initial memos behind an approval gate. Target: 80% reduction in intake processing time. <em>~$2,000, 10 days.</em></li>
</ul>

<h3>The connector layer</h3>
<p>Most failed deployments stall because nothing connects the model to the business. We build the connector layer — CRM, EHR, Airtable, billing, Slack, email — so the agent completes tasks rather than describing them.</p>

<h3>Handover</h3>
<p>Two-week handover with full runbooks and video training. There is no new software for your team to learn; the automation lives inside the tools they already open every morning.</p>
    `,
    icon: '⚡',
    benefits: [
      'Fixed price, $1,500 – $3,500 — 50% upfront',
      'Working system in 7 to 14 days, not a prototype',
      'Integrated into your existing CRM, EHR or billing stack',
      'Human-in-the-loop approval gates on every critical action',
      'Two-week handover with runbooks and video training'
    ],
    pricing: '$1,500 – $3,500 fixed price (50% upfront)',
    isPublished: true,
    sortOrder: 2,
    seo: {
      title: 'Quick-Win Automation Sprint | Generativ Consulting Company',
      description:
        'One automated system shipped end to end in 7 to 14 days for a fixed $1,500 to $3,500, integrated into the tools your team already uses.',
      keywords: ['automation sprint', 'AI implementation', 'speed to lead', 'patient intake automation']
    }
  },
  {
    slug: 'managed-operations',
    title: 'Managed Operations Retainer',
    shortDescription:
      'Continuous monitoring, model versioning and pipeline tuning so your agents keep working as the models shift underneath them.',
    fullDescription: `
<p>Foundation models move fast. An agent that was correct in March can be subtly wrong in September, and nothing will announce it. The retainer is the maintenance layer that keeps deployed systems trustworthy.</p>

<h3>What is included</h3>
<ul>
  <li><strong>Model versioning:</strong> pinned versions, staged upgrades, and regression evaluation before anything reaches production.</li>
  <li><strong>Observability:</strong> traces that tie every non-deterministic decision back to the inputs that produced it.</li>
  <li><strong>Retrieval-pipeline tuning:</strong> keeping the retrieval layer honest as your documents, listings and records change.</li>
  <li><strong>Evaluation cycles:</strong> the eval pipelines that let a professional practice survive an audit or a disclosure requirement.</li>
</ul>

<p>This is the difference between an automation that works and an automation that keeps working.</p>
    `,
    icon: '📈',
    benefits: [
      'Model versioning and staged upgrades',
      'Full decision traceability and observability',
      'Continuous retrieval-pipeline optimization',
      'Evaluation cycles that survive professional audit',
      'Ongoing partnership — no re-scoping every quarter'
    ],
    pricing: '$1,500 – $5,000 per month',
    isPublished: true,
    sortOrder: 3,
    seo: {
      title: 'Managed Operations Retainer | Generativ Consulting Company',
      description:
        'Continuous monitoring, model versioning, observability and retrieval-pipeline tuning for deployed AI agents.',
      keywords: ['managed AI operations', 'model versioning', 'AI observability', 'LLMOps']
    }
  },
  {
    slug: 'safety-testing',
    title: 'AI Safety Testing',
    shortDescription:
      'The governance and evaluation practice behind the audit — red teaming, output validation and compliance controls for non-deterministic systems.',
    fullDescription: `
<p>Safety Testing is the capability that makes an audit finding trustworthy. Before we tell you an automation will save $18,000 a year, we have to be able to say what it does when it is wrong.</p>

<p>It is available as a standalone engagement for teams already running AI in production, and it is folded into every Sprint and Retainer by default.</p>

<h3>The Agent See Safety Protocol</h3>
<ul>
  <li><strong>Red Team Testing:</strong> adversarial prompting to uncover vulnerabilities before a client does.</li>
  <li><strong>Output Validation:</strong> systematic verification of AI-generated content and code.</li>
  <li><strong>Compliance Checking:</strong> outputs measured against regulatory and disclosure standards — including AI-disclosure regimes such as the 15th Judicial Circuit AO 2.109-4/26.</li>
  <li><strong>Edge Case Analysis:</strong> stress testing with unusual and boundary inputs.</li>
  <li><strong>Continuous Monitoring:</strong> ongoing evaluation once the system is live.</li>
</ul>

<h3>Human-in-the-loop gates</h3>
<p>For any critical action — sending a client email, modifying a legal document, processing a transaction — the agent drafts, queues, and alerts. A person verifies and approves before anything goes live.</p>
    `,
    icon: '🔒',
    benefits: [
      'Identify and mitigate hallucination risk before deployment',
      'Reduce security and disclosure exposure',
      'Human-in-the-loop approval gates on critical actions',
      'Evidence trails that survive a professional audit cycle',
      'Prevent costly errors and reputational damage'
    ],
    pricing: 'Included in Sprint and Retainer engagements; standalone assessments from $15,000',
    isPublished: true,
    sortOrder: 4,
    seo: {
      title: 'AI Safety Testing | Generativ Consulting Company',
      description:
        'Red teaming, output validation, compliance checking and human-in-the-loop controls for production AI systems.',
      keywords: ['AI safety', 'AI testing', 'hallucination prevention', 'human in the loop']
    }
  },
  {
    slug: 'parallelization',
    title: 'Parallelization Infrastructure',
    shortDescription:
      'The throughput engineering that lets a document or intake pipeline run at volume instead of one file at a time.',
    fullDescription: `
<p>Extraction that takes 1–2 seconds per document is only useful if it can run across every document you have. Parallelization is what turns a working automation into one that clears a backlog.</p>

<h3>Where it shows up in an engagement</h3>
<ul>
  <li><strong>Batch document intelligence:</strong> years of physical case files, digitized and extracted in a single pass.</li>
  <li><strong>Continuous syncing:</strong> listings, records and billing states reconciled without a nightly job that never finishes.</li>
  <li><strong>Resource orchestration:</strong> intelligent allocation so cost tracks volume rather than headroom.</li>
  <li><strong>Performance monitoring:</strong> continuous evaluation and tuning as load changes.</li>
</ul>

<p>Available standalone for teams running their own AI workloads, and applied wherever a Sprint deliverable has to operate at scale.</p>
    `,
    icon: '⚙️',
    benefits: [
      'Clear document and record backlogs in a single pass',
      'Reduce infrastructure cost through orchestration',
      'Scale with demand instead of provisioning for peak',
      'Keep extraction and sync pipelines from becoming the new bottleneck',
      'Continuous performance monitoring and tuning'
    ],
    pricing: 'Custom pricing based on workload',
    isPublished: true,
    sortOrder: 5,
    seo: {
      title: 'Parallelization Infrastructure | Generativ Consulting Company',
      description:
        'Throughput engineering for document intelligence and data pipelines — batch extraction, orchestration and continuous sync at volume.',
      keywords: ['parallelization', 'batch processing', 'AI infrastructure', 'document pipelines']
    }
  },
  {
    slug: 'critical-thinking',
    title: 'Critical Thinking Education',
    shortDescription:
      'The two-week handover, made durable — the judgment your team needs to run automated systems without us.',
    fullDescription: `
<p>Every Sprint ends with a handover: runbooks, video training, and the working knowledge to operate what we built. This service is that handover extended into a standing capability.</p>

<p>The goal is explicit: reduce your dependence on outside consultants, including us.</p>

<h3>What the programs cover</h3>
<ul>
  <li><strong>Approval-gate judgment:</strong> what to check before clicking Approve on an agent-drafted action.</li>
  <li><strong>Error recognition:</strong> spotting the subtle inaccuracies that look plausible and are not.</li>
  <li><strong>Prompt and instruction design:</strong> getting reliable behaviour out of the tools your team already touches.</li>
  <li><strong>Output evaluation:</strong> systematic assessment of AI-generated content against the original objective.</li>
  <li><strong>Ethics and disclosure:</strong> what has to be told to a client, a patient, or a court.</li>
</ul>
    `,
    icon: '🧠',
    benefits: [
      'Staff who can operate approval gates with confidence',
      'Faster, more reliable error recognition',
      'Reduced dependence on external consultants',
      'A culture of responsible, disclosed AI use',
      'Included as a two-week handover with every Sprint'
    ],
    pricing: 'Included with Sprint handover; standalone workshop packages from $5,000',
    isPublished: true,
    sortOrder: 6,
    seo: {
      title: 'Critical Thinking Education | Generativ Consulting Company',
      description:
        'Training that lets your team operate automated systems confidently — approval-gate judgment, error recognition, and disclosure practice.',
      keywords: ['AI education', 'critical thinking', 'AI literacy', 'human in the loop training']
    }
  }
];

// ---------------------------------------------------------------------------
// Blog — one post per factor behind the offer.
// ---------------------------------------------------------------------------

const daysAgo = (n: number) => new Date(Date.now() - n * 24 * 60 * 60 * 1000).toISOString();

const blogPosts: BlogSeed[] = [
  {
    slug: 'the-silent-leak-invisible-overhead',
    title: 'The Silent Leak: What Invisible Overhead Actually Costs a Storefront',
    content: `
<p>No line on a P&amp;L is labelled "invisible overhead". That is precisely what makes it expensive. The money leaves in amounts too small to trigger an alarm, on a schedule too regular to notice.</p>

<h2>Leak one: communication</h2>
<p><strong>42% of local businesses lose money to missed calls.</strong> For most of them the figure is over <strong>$500 a month</strong> — calls that arrived while the front desk was with someone else, after closing, or on a Saturday. Nobody logs a call that was never answered, so the loss never appears in a report. It appears as a quiet, permanent ceiling on new business.</p>

<h2>Leak two: operations</h2>
<p><strong>Manual document processing takes 10 to 30 minutes per file</strong>, which works out to <strong>$12 to $20 in labor per form</strong>. Intake sheets, ID cards, referral packets, tax documents — the same standard fields, extracted by hand, over and over. At a hundred forms a month that is a part-time salary spent on retyping.</p>

<h2>Leak three: latency</h2>
<p>The industry-standard first response to an inbound lead is around <strong>12 minutes</strong>. A renter browsing listings does not wait 12 minutes; they click the next result. The lead was never lost to a better offer. It was lost to a faster reply.</p>

<h2>Why this is worth auditing rather than guessing</h2>
<p>Each of these is individually small enough to rationalize and collectively large enough to matter. The purpose of a five-day, on-site audit is to convert them from a feeling into arithmetic: how many calls, how many forms, how many minutes, at what loaded labor rate. Once it is written down with assumptions you can check, it stops being overhead you tolerate and becomes a number you can decide about.</p>

<p><em>Every figure above is one we will recalculate against your actual operation during the audit — and if the total does not clear $5,000 a year, you get the $500 back.</em></p>
    `,
    excerpt:
      'Missed calls at $500+/month, $12–$20 per manually processed form, and a 12-minute lead response. Three leaks small enough to ignore and large enough to matter.',
    author: 'Generativ Consulting Company',
    categories: ['Profit Leak', 'Operations'],
    tags: ['missed calls', 'document processing', 'speed to lead', 'overhead'],
    isPublished: true,
    publishedAt: daysAgo(2),
    seo: {
      title: 'The Silent Leak: What Invisible Overhead Costs a Storefront',
      description:
        '42% of local businesses lose over $500 a month to missed calls, and manual forms cost $12–$20 each. A breakdown of where small-business margin quietly goes.',
      keywords: ['profit leak', 'missed calls', 'manual data entry cost', 'small business overhead']
    }
  },
  {
    slug: 'speed-to-lead-12-minutes-to-12-seconds',
    title: 'Speed-to-Lead: From 12 Minutes to 12 Seconds',
    content: `
<p>In a dense rental market, lead loss is a 24/7 threat, and it is almost never a pricing problem. Inquiries arrive at 9pm on a Sunday from a listing portal. By Monday at 10am, the prospect has toured two other apartments.</p>

<h2>The gap, measured</h2>
<p>The industry-standard first response time to an inbound property inquiry sits around <strong>12 minutes</strong> during business hours — and effectively runs to hours or days outside them. An automated intake agent responds in about <strong>12 seconds</strong>, at any hour, without anyone being on shift.</p>

<h2>What the system actually does</h2>
<ol>
  <li><strong>Monitors</strong> listing portals and web forms continuously.</li>
  <li><strong>Qualifies</strong> the prospect against real criteria — move-in date, budget, credit range — in under 60 seconds.</li>
  <li><strong>Matches</strong> them against live inventory rather than a generic acknowledgement.</li>
  <li><strong>Books</strong> the hot ones directly onto an agent's calendar and routes the rest for follow-up.</li>
</ol>
<p>In real-world pilots this pattern has been used to match against portfolios exceeding £18B in property value. The mechanism is not exotic; it is the connector layer between the portal and the calendar, which most brokerages simply do not have.</p>

<h2>What it is worth</h2>
<p>A brokerage losing even a handful of fee-earning inquiries a month to slow follow-up is losing more than the entire cost of building the system. Teams with steady inbound typically see payback in <strong>two to three weeks</strong>, with booking rates up roughly 20% within the first month.</p>

<h2>The part that is not automation</h2>
<p>Speed only helps if the qualification logic reflects how your agents actually work. That is what Day 1 of the audit is for: walking the real intake path with the person who runs it, including the exceptions nobody wrote down.</p>
    `,
    excerpt:
      'The industry standard first response to a property inquiry is 12 minutes. An automated intake agent answers in 12 seconds — and books the tour while your team sleeps.',
    author: 'Generativ Consulting Company',
    categories: ['Real Estate', 'Automation'],
    tags: ['speed to lead', 'real estate', 'lead qualification', 'CRM integration'],
    isPublished: true,
    publishedAt: daysAgo(5),
    seo: {
      title: 'Speed-to-Lead: From 12 Minutes to 12 Seconds | Generativ Consulting',
      description:
        'How a 24/7 lead intake agent qualifies renters and buyers in under 60 seconds, cutting first response from 12 minutes to 12 seconds.',
      keywords: ['speed to lead', 'real estate automation', 'lead response time', 'StreetEasy automation']
    }
  },
  {
    slug: 'clinic-intake-and-the-no-show-problem',
    title: 'Clinic Intake and the No-Show Problem: Reclaiming 8 to 12 Hours a Week',
    content: `
<p>A neighbourhood clinic does not lose money dramatically. It loses it in eight to fifteen hours a week of front-desk time spent on phone tag, retyping paper intake forms into the EHR, and chasing past-due invoices.</p>

<h2>Where the hours go</h2>
<ul>
  <li><strong>Appointment reminders</strong> placed by hand, one call at a time, most going to voicemail.</li>
  <li><strong>Paper intake</strong> completed in the waiting room, then retyped — with transcription errors that surface later as billing problems.</li>
  <li><strong>Billing follow-up</strong> on invoices that are only late because nobody had time to send a reminder.</li>
</ul>

<h2>What replaces it</h2>
<p>Intake forms are texted directly to the patient before the visit, validated on submission, and written as structured data straight into your system. Appointment management runs over text, where people actually respond. Invoice reminders monitor payment status and send friendly nudges without anyone deciding to.</p>

<h2>The measured outcome</h2>
<p>Practices running this pattern reclaim <strong>8 to 12 staff hours per week</strong>, with <strong>over 5 hours saved per doctor</strong> through multi-channel scheduling and pre-appointment assistants, and patient engagement up more than <strong>20%</strong>. No-show rates fall sharply — the reminder that gets read is the one that arrives as a text.</p>

<h2>Compliance is the first constraint, not the last</h2>
<p>Everything here touches PHI, so the architecture starts there: HIPAA-ready handling, isolated storage, role-based access, and no patient data used to train public models. The audit inventories what you have before anything is designed, because a workflow that cannot pass review is not a saving — it is a liability with a stopwatch on it.</p>
    `,
    excerpt:
      'Front-desk staff lose 8–15 hours a week to phone tag and retyping intake forms. Automated intake and text-based scheduling give most of it back.',
    author: 'Generativ Consulting Company',
    categories: ['Medical & Dental', 'Automation'],
    tags: ['patient intake', 'no-shows', 'HIPAA', 'scheduling automation'],
    isPublished: true,
    publishedAt: daysAgo(8),
    seo: {
      title: 'Clinic Intake and the No-Show Problem | Generativ Consulting',
      description:
        'Automated patient intake and text-based scheduling reclaim 8 to 12 staff hours a week and cut no-shows in neighbourhood clinics.',
      keywords: ['patient intake automation', 'no-show reduction', 'HIPAA automation', 'dental practice automation']
    }
  },
  {
    slug: 'document-intelligence-from-20-dollars-to-2-36',
    title: 'Document Intelligence: From $20 a Form to $2.36',
    content: `
<p>Paperwork-dense practices — immigration and personal injury law, tax preparation, notary services — run on the same operation repeated thousands of times: read an incoming document, find the standard fields, type them somewhere else.</p>

<h2>The arithmetic</h2>
<p>Manual processing takes <strong>10 to 30 minutes per file</strong> at a loaded cost of <strong>$12 to $20 per form</strong>. Document intelligence performs the same extraction in <strong>1 to 2 seconds</strong> at roughly <strong>$2.36 per form</strong> — an <strong>80% reduction</strong> in processing cost. For a practice handling a few hundred documents a month, that difference is a hiring decision.</p>

<h2>What a secure pipeline looks like</h2>
<ul>
  <li><strong>Ingestion</strong> from scanners, email and portals — including physical paper, which is still how a great many offices operate.</li>
  <li><strong>Extraction</strong> of the specific fields your matter type requires, with validation checks rather than blind trust.</li>
  <li><strong>Approval gates:</strong> the agent drafts the memo or the record update, queues it, and alerts a human. Nothing goes live unapproved.</li>
  <li><strong>Isolation:</strong> local or air-gapped processing where privilege demands it. Client material does not go to a public model.</li>
</ul>

<h2>Disclosure is now part of the design</h2>
<p>AI-disclosure rules such as the 15th Judicial Circuit's AO 2.109-4/26 make traceability a filing requirement, not an engineering preference. Every automated action has to be attributable, reviewable, and disclosable. Systems built without that from the start get retrofitted expensively or abandoned.</p>

<h2>The realistic target</h2>
<p>Practices deploying this typically cut case intake processing time by around <strong>80%</strong> and free roughly <strong>10 hours a week</strong> of administrative time — while improving accuracy, because validated extraction beats a person retyping an address at 4:45pm.</p>
    `,
    excerpt:
      'Manual extraction costs $12–$20 per form and takes 10–30 minutes. Secure document intelligence does it in 1–2 seconds at $2.36 — with disclosure controls built in.',
    author: 'Generativ Consulting Company',
    categories: ['Legal & Professional', 'Automation'],
    tags: ['document intelligence', 'legal automation', 'data extraction', 'AI disclosure'],
    isPublished: true,
    publishedAt: daysAgo(11),
    seo: {
      title: 'Document Intelligence: From $20 a Form to $2.36 | Generativ Consulting',
      description:
        'Secure document extraction in 1–2 seconds at $2.36 per form, with human-in-the-loop approval gates and AI-disclosure readiness.',
      keywords: ['document intelligence', 'legal AI', 'data extraction cost', 'AO 2.109-4/26']
    }
  },
  {
    slug: 'why-40-percent-of-agentic-ai-projects-get-cancelled',
    title: 'Why Over 40% of Agentic AI Projects Are Expected to Be Cancelled',
    content: `
<p>Gartner's forecast is blunt: <strong>more than 40% of agentic AI projects are expected to be cancelled by the end of 2027</strong>. Read alongside the adoption numbers, it is a stranger picture than it first appears.</p>

<h2>Both things are true</h2>
<ul>
  <li>Enterprise applications with task-specific AI agents are projected to go from <strong>under 5% in 2025 to 40% by the end of 2026</strong> (Gartner).</li>
  <li><strong>23% of organizations are already scaling</strong> agentic systems and another <strong>39% are actively experimenting</strong> (McKinsey).</li>
  <li>By <strong>2028, 15% of day-to-day work decisions</strong> are expected to be made autonomously — up from 0% in 2024.</li>
</ul>
<p>Adoption is accelerating and cancellation rates are high at the same time. That combination tells you the failures are not technological.</p>

<h2>What actually kills these projects</h2>
<p>Three causes recur: <strong>escalating cost</strong> with no ceiling anyone agreed to, <strong>unclear business value</strong> — nobody defined what success would look like in dollars — and <strong>inadequate risk controls</strong> for systems that are non-deterministic by construction.</p>
<p>There is a fourth, more mundane one: <strong>data quality is implicated in roughly 85% of failed AI projects.</strong> Agents built on unreconciled spreadsheets and duplicate records hallucinate for entirely ordinary reasons.</p>

<h2>The pattern behind the failures</h2>
<p>Most cancelled projects are a rebranded chatbot with an agent label. An agent is not a single model call wrapped in a UI. Real deployments need planning loops with retries, state that survives failure, a connector layer into the systems of record, and traces from every decision back to its inputs.</p>

<h2>What we do about it</h2>
<p>Every opportunity in an audit has to pass five tests before it makes the roadmap: <strong>Orchestration</strong>, <strong>Governance</strong>, <strong>Integration</strong>, <strong>Observability</strong>, and <strong>Outcomes</strong> — with success denominated in resolution time and revenue uplift rather than agents shipped. Anything that fails a test does not get built. That is the cheapest possible place to cancel a project: before it starts, for $500, with the reasons written down.</p>
    `,
    excerpt:
      'Gartner expects over 40% of agentic AI projects to be cancelled by 2027 — from cost, unclear value and missing risk controls. The five tests that catch it early.',
    author: 'Generativ Consulting Company',
    categories: ['Agentic AI', 'Strategy'],
    tags: ['Gartner', 'agentic AI', 'project failure', 'governance', 'observability'],
    isPublished: true,
    publishedAt: daysAgo(14),
    seo: {
      title: 'Why Over 40% of Agentic AI Projects Get Cancelled | Generativ Consulting',
      description:
        'Gartner forecasts over 40% of agentic AI projects cancelled by end of 2027. The causes are cost, unclear value and risk controls — not the models.',
      keywords: ['agentic AI failure', 'Gartner agentic AI', 'AI project cancellation', 'AI governance']
    }
  },
  {
    slug: 'data-quality-is-85-percent-of-the-problem',
    title: 'The Reconciliation Gap: Data Quality Is 85% of the Problem',
    content: `
<p>When an agent invents a fact, the instinct is to blame the model. Usually the model is reporting faithfully on bad inputs. <strong>Data quality issues are implicated in roughly 85% of failed AI projects.</strong></p>

<h2>What the gap looks like in a real office</h2>
<ul>
  <li>The same client exists three times across the CRM, the billing tool and a spreadsheet, with three different addresses.</li>
  <li>A booking system and an accounting system disagree about who was seen last Tuesday, and neither is authoritative.</li>
  <li>Fields that were free text for six years contain nine spellings of the same value.</li>
  <li>The single most current record lives in someone's inbox.</li>
</ul>
<p>A human absorbs all of this without noticing — they know which system to trust for what. An agent has no such intuition. It answers confidently from whichever record it reached first.</p>

<h2>Deduplicate before you automate</h2>
<p>Before autonomous agents touch anything, the underlying data has to be audited, deduplicated and unified. That is why the AI Opportunity Audit inventories every SaaS platform, spreadsheet and database in the operation — not to criticize the stack, but to establish what an agent could safely treat as fact.</p>

<h2>Why this is the cheapest thing to fix first</h2>
<p>Cleaning up reconciliation is unglamorous and it is the highest-leverage work available. It makes the automation reliable, it makes the reporting true, and it usually surfaces a few thousand dollars of billing that quietly fell between two systems. Most operations find the cleanup pays for itself before the first agent ships.</p>

<p><em>The audit's Readiness Score exists specifically to grade this: infrastructure, data quality, and team capability, scored before anyone writes a line of code.</em></p>
    `,
    excerpt:
      'Roughly 85% of failed AI projects trace back to data quality. Duplicate records and unreconciled systems make agents hallucinate for entirely ordinary reasons.',
    author: 'Generativ Consulting Company',
    categories: ['Data Quality', 'Strategy'],
    tags: ['data quality', 'reconciliation', 'hallucination', 'readiness score'],
    isPublished: true,
    publishedAt: daysAgo(17),
    seo: {
      title: 'The Reconciliation Gap: Data Quality Is 85% of the Problem',
      description:
        'Data quality issues are responsible for around 85% of failed AI projects. Why deduplication and reconciliation have to come before autonomous agents.',
      keywords: ['data quality', 'AI project failure', 'data reconciliation', 'hallucination prevention']
    }
  }
];

// ---------------------------------------------------------------------------
// Idempotent upsert
// ---------------------------------------------------------------------------

async function upsertPages(): Promise<{ created: number; updated: number }> {
  const existing = await getAllPages();
  let created = 0;
  let updated = 0;

  for (const seed of [homePage, aboutPage]) {
    const matches = existing.filter(p => p.slug === seed.slug);
    if (matches.length === 0) {
      await createPage(seed);
      created++;
    } else {
      // Update every record carrying this slug so no stale duplicate can win a lookup.
      // Preserve the original publication date on re-sync.
      const { publishedAt, ...rest } = seed;
      for (const match of matches) {
        await updatePage(match.id, rest);
        updated++;
      }
    }
  }

  return { created, updated };
}

async function upsertServices(): Promise<{ created: number; updated: number }> {
  const existing = await getAllServices();
  let created = 0;
  let updated = 0;

  for (const seed of services) {
    const matches = existing.filter(s => s.slug === seed.slug);
    if (matches.length === 0) {
      await createService(seed);
      created++;
    } else {
      for (const match of matches) {
        await updateService(match.id, seed);
        updated++;
      }
    }
  }

  return { created, updated };
}

async function upsertBlogPosts(): Promise<{ created: number; updated: number }> {
  const existing = await getAllBlogPosts();
  let created = 0;
  let updated = 0;

  for (const seed of blogPosts) {
    const matches = existing.filter(p => p.slug === seed.slug);
    if (matches.length === 0) {
      await createBlogPost(seed);
      created++;
    } else {
      for (const match of matches) {
        // Preserve the original publication date on re-sync.
        const { publishedAt, ...rest } = seed;
        await updateBlogPost(match.id, rest);
        updated++;
      }
    }
  }

  return { created, updated };
}

/**
 * Earlier seed data stored unresolved placeholder ids (`team_1`, `team_2`, ...) in
 * BlogPost.author. Both BlogPage and BlogPostPage render that field verbatim, so
 * those placeholders show up as a visible byline. Normalize them.
 */
async function repairBlogBylines(): Promise<number> {
  const posts = await getAllBlogPosts();
  let repaired = 0;

  for (const post of posts) {
    if (/^team_\d+$/.test(post.author || '')) {
      await updateBlogPost(post.id, { author: 'Generativ Consulting Company' });
      repaired++;
    }
  }

  return repaired;
}

async function upsertSiteSettings(): Promise<void> {
  const current = await getSiteSettings();

  const next: Omit<SiteSettings, 'updatedAt'> = {
    siteName: 'Generativ Consulting Company',
    tagline: PRIME_DIRECTIVE.promise,
    contactEmail: current?.contactEmail || 'info@generativ.cc',
    contactPhone: current?.contactPhone,
    address: current?.address,
    logo: current?.logo,
    favicon: current?.favicon,
    socialLinks: current?.socialLinks || {
      linkedin: 'https://linkedin.com/company/generativ-cc',
      twitter: 'https://twitter.com/generativcc',
      github: 'https://github.com/generativcc'
    },
    footer: {
      copyrightText: `© ${new Date().getFullYear()} Generativ Consulting Company. All rights reserved.`,
      showLogo: true,
      columns: [
        {
          title: 'The Offer',
          links: [
            { text: 'AI Opportunity Audit — $500', url: '/services/ai-opportunity-audit' },
            { text: 'Quick-Win Sprint', url: '/services/quick-win-sprint' },
            { text: 'Managed Operations', url: '/services/managed-operations' }
          ]
        },
        {
          title: 'Capability',
          links: [
            { text: 'AI Safety Testing', url: '/services/safety-testing' },
            { text: 'Parallelization', url: '/services/parallelization' },
            { text: 'Critical Thinking', url: '/services/critical-thinking' }
          ]
        },
        {
          title: 'Company',
          links: [
            { text: 'About Us', url: '/about' },
            { text: 'Our Team', url: '/team' },
            { text: 'Leak Diagnostics', url: '/blog' },
            { text: 'Book the Audit', url: '/contact' }
          ]
        }
      ]
    },
    analytics: current?.analytics || { enableCookieBanner: true },
    globalSEO: {
      title: 'Generativ Consulting Company | AI Opportunity Audit — $500, 5 Days',
      description:
        'A flat $500, five-day AI Opportunity Audit that maps your top three operational leaks with quantified savings. Backed by a $5,000 annual-savings guarantee.',
      keywords: [
        'AI opportunity audit',
        'small business AI',
        'automation audit',
        'speed to lead',
        'document intelligence',
        'agentic AI'
      ]
    }
  };

  await saveSiteSettings(next);
}

/**
 * Apply the prime directive to the CMS database. Safe to run repeatedly.
 */
export async function syncPrimeDirective() {
  console.log('Applying prime directive to CMS content...');

  await upsertSiteSettings();
  console.log('  site settings: updated');

  const pageResult = await upsertPages();
  console.log(`  pages: ${pageResult.created} created, ${pageResult.updated} updated`);

  const serviceResult = await upsertServices();
  console.log(`  services: ${serviceResult.created} created, ${serviceResult.updated} updated`);

  const blogResult = await upsertBlogPosts();
  console.log(`  blog posts: ${blogResult.created} created, ${blogResult.updated} updated`);

  const repaired = await repairBlogBylines();
  console.log(`  placeholder bylines repaired: ${repaired}`);

  console.log('Prime directive applied.');
}
