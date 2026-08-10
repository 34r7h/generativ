/**
 * PRIME DIRECTIVE
 *
 * The canonical, code-owned content describing what Generativ Consulting Company does:
 *
 *   The AI Opportunity Audit — a two-day, on-site operational review, flat $500.
 *   It documents the three bottlenecks costing the practice the most, with the
 *   arithmetic behind each. The fee is credited against an implementation, or
 *   refunded if the review does not find at least $5,000 in annual savings.
 *
 * Pages, services and blog are arranged around that work. Copy here is plain and
 * factual by policy: no superlatives, no repeated calls to action, no sales framing.
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
  deleteService,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
  getAllTeamMembers,
  createTeamMember,
  updateTeamMember,
  getSiteSettings,
  saveSiteSettings
} from './db.js';
import type { Page, Service, BlogPost, SiteSettings, TeamMember } from './schema';

type PageSeed = Omit<Page, 'id' | 'createdAt' | 'updatedAt'>;
type ServiceSeed = Omit<Service, 'id' | 'createdAt' | 'updatedAt'>;
type BlogSeed = Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>;
type TeamSeed = Omit<TeamMember, 'id' | 'createdAt' | 'updatedAt'>;

// ---------------------------------------------------------------------------
// The offer, stated once, reused everywhere.
// ---------------------------------------------------------------------------

export const PRIME_DIRECTIVE = {
  offer: 'AI Opportunity Audit',
  price: '$500 flat fee',
  duration: '2 days on-site',
  terms:
    'The fee is credited against an implementation if you proceed, or refunded if the review does not identify at least $5,000 in annual savings.',
  summary: 'Operational review, automation build, and the practice behind both.'
};

// The measured factors behind the offer. Sourced from the 2026 Uptown NYC
// engagement research; each figure is attributed where it is rendered.
const LEAK_STATS = [
  {
    value: '42%',
    label: 'of local businesses lose money to missed calls',
    detail: 'Typically over $500 a month in attributable revenue.'
  },
  {
    value: '$12–$20',
    label: 'labor cost per manually processed form',
    detail: 'Manual document processing runs 10–30 minutes per file.'
  },
  {
    value: '12 min',
    label: 'industry-standard first response to an inbound lead',
    detail: 'Automated qualification and routing responds in roughly 12 seconds.'
  },
  {
    value: '85%',
    label: 'of failed AI projects trace back to data quality',
    detail: 'Duplicate records and unreconciled systems, not model capability.'
  }
];

const VERTICALS = [
  {
    title: 'Real estate and property management',
    leak: 'Inbound inquiries arriving after hours or at weekends are answered late, if at all.',
    before: 'Manual sorting; around 12 minutes to first response',
    after: 'Qualified and routed in under 60 seconds',
    proof: 'Reported payback in two to three weeks where inbound volume is steady.'
  },
  {
    title: 'Dental and medical practices',
    leak: 'Appointment reminders and paper intake consume 8 to 15 front-desk hours a week.',
    before: 'Phone reminders; paper intake retyped into the EHR',
    after: 'Text-based scheduling with validated intake written as structured data',
    proof: 'Around 5 hours per clinician per week; 8 to 12 staff hours recovered.'
  },
  {
    title: 'Law and tax offices',
    leak: 'Standard fields extracted by hand from client documents, at $12 to $20 per form.',
    before: 'Manual review of contracts, referral packets and tax documents',
    after: 'Extraction in 1 to 2 seconds behind a human approval gate',
    proof: 'Designed for AI-disclosure requirements such as 15th Judicial Circuit AO 2.109-4/26.'
  }
];

const ONSITE_SCHEDULE = [
  {
    title: 'Day 1 — Discovery and analysis',
    description:
      'Workflow walks and tool inventory with the owner-operator present, then bottleneck ' +
      'scoring and review of the internal logic each process depends on.'
  },
  {
    title: 'Day 2 — Sizing, roadmap and delivery',
    description:
      'Opportunity sizing against stated labor and time assumptions, the 90-day roadmap, and ' +
      'written delivery of the readiness assessment and the three bottlenecks before we leave.'
  }
];

const FIVE_TESTS = [
  {
    title: 'Orchestration',
    description:
      'Planning loops, retries, and state that survives a failure partway through a task.'
  },
  {
    title: 'Governance',
    description:
      'PII handling and evaluation pipelines that hold up under a professional audit cycle.'
  },
  {
    title: 'Integration',
    description:
      'Connection into the existing CRM, EHR or order pipeline rather than alongside it.'
  },
  {
    title: 'Observability',
    description:
      'Each non-deterministic decision traceable to the inputs that produced it.'
  },
  {
    title: 'Outcomes',
    description:
      'Measured in resolution time and revenue, not in the number of agents deployed.'
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
      title: 'AI Opportunity Audit',
      content:
        'A two-day, on-site review of how work moves through a practice. It ends in a written report: the three bottlenecks costing the most, each with its annual cost and the assumptions behind it.',
      sortOrder: 1,
      settings: {
        ctaPrimary: { text: 'What the audit covers', url: '/services/ai-opportunity-audit' }
      }
    },
    {
      id: 'method',
      type: 'content',
      title: 'How the audit runs',
      content:
        '<p>Two days, on-site, with the owner-operator present on the first morning. The diagnostic only holds if it captures how the office actually works, including the exceptions nobody wrote down.</p>',
      sortOrder: 2,
      settings: { steps: ONSITE_SCHEDULE }
    },
    {
      id: 'verticals',
      type: 'content',
      title: 'Where the time goes',
      content:
        '<p>Three operational patterns we have measured in real estate, clinical and legal practices.</p>',
      sortOrder: 3,
      settings: { verticals: VERTICALS }
    },
    {
      id: 'evidence',
      type: 'content',
      title: 'Reference figures',
      content:
        '<p>Baselines we start from. The audit recalculates each against your own numbers rather than assuming them.</p>',
      sortOrder: 4,
      settings: {
        stats: LEAK_STATS,
        statsNote:
          'Missed-call and form-processing figures from 2026 small-business automation research; lead-response benchmark from industry reporting; data-quality figure from published AI project post-mortems.'
      }
    },
    {
      id: 'services-overview',
      type: 'services',
      title: 'Services',
      content: 'What follows an audit, and the practice behind it.',
      sortOrder: 5,
      settings: {}
    },
    {
      id: 'team-overview',
      type: 'team',
      title: 'Team',
      content: '',
      sortOrder: 6,
      settings: { showMembers: 3, ctaText: 'Full team', ctaUrl: '/team' }
    }
  ],
  seo: {
    title: 'Generativ Consulting Company',
    description:
      'Operational review and automation implementation for professional practices. A two-day, on-site assessment documenting where process time and margin are lost.',
    keywords: [
      'AI opportunity audit',
      'operational assessment',
      'workflow automation',
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
      title: 'About',
      content:
        'We build automated processes that handle repetitive administrative work inside professional practices, and we assess where that work is worth automating before building anything.',
      sortOrder: 1,
      settings: {}
    },
    {
      id: 'about-mission',
      type: 'content',
      title: 'What we do',
      content:
        '<p>Generativ Consulting Company assesses and automates administrative processes inside professional practices — real estate, clinical, and legal. Engagements begin with a two-day, on-site operational review that identifies the three processes costing the practice the most and documents the arithmetic behind each.</p><p>The wider practice — safety testing, throughput engineering, and staff training — is what makes those findings dependable in production rather than only on paper.</p>',
      sortOrder: 2,
      settings: {}
    },
    {
      id: 'about-five-tests',
      type: 'content',
      title: 'Five tests applied to any proposed automation',
      content:
        '<p>Each opportunity identified in a review is assessed against the same five criteria before it is recommended.</p>',
      sortOrder: 3,
      settings: { values: FIVE_TESTS }
    },
    {
      id: 'about-market',
      type: 'content',
      title: 'Market conditions',
      content:
        '<p>Adoption is accelerating while cancellation rates remain high. Both figures matter when deciding what to build.</p>',
      sortOrder: 4,
      settings: {
        stats: [
          {
            value: '40%+',
            label: 'of agentic AI projects expected to be canceled by end of 2027',
            detail: 'Gartner — driven by cost, unclear value, and inadequate risk controls.'
          },
          {
            value: '<5% to 40%',
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
      title: 'How the review runs',
      content:
        '<p>The review runs over two days on-site. The owner-operator is present on the first morning; the diagnostic is only accurate if it reflects how the office actually works.</p>',
      sortOrder: 5,
      settings: { steps: ONSITE_SCHEDULE }
    },
    {
      id: 'about-values',
      type: 'content',
      title: 'How we work',
      content: '',
      sortOrder: 6,
      settings: {
        values: [
          {
            title: 'Measurement',
            description:
              'Work that cannot be measured in hours or cash is not proposed. Each figure is shown with the assumptions behind it.'
          },
          {
            title: 'Confidentiality',
            description:
              'Reviews are observational. An NDA is signed before the first day, no client files are copied, and client data is not used to train public models.'
          },
          {
            title: 'Scope',
            description:
              'Automation is applied to repetitive, high-volume processes with clear rules. Judgement stays with the practice.'
          },
          {
            title: 'Handover',
            description:
              'Each implementation ends with runbooks and training so the system can be operated without us.'
          }
        ]
      }
    },
    {
      id: 'about-cta',
      type: 'cta',
      title: 'Inquiries',
      content:
        'Scoping starts with a short conversation about how the practice currently runs.',
      sortOrder: 7,
      settings: {
        ctaPrimary: { text: 'Contact', url: '/contact' }
      }
    }
  ],
  seo: {
    title: 'About — Generativ Consulting Company',
    description:
      'How the operational review is conducted, the five tests applied to any proposed automation, and the market conditions behind them.',
    keywords: ['about', 'agentic AI', 'AI governance', 'AI observability', 'operational review']
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
      'A two-day, on-site review documenting the three processes costing the practice the most, with the arithmetic for each.',
    fullDescription: `
<p>A two-day, on-site review of how work moves through a practice, delivered as a written report.</p>

<h3>Deliverables</h3>
<ul>
  <li><strong>Readiness assessment:</strong> the state of the existing systems, the quality of the underlying data, and what the team can realistically operate.</li>
  <li><strong>Three bottlenecks:</strong> the processes consuming the most manual labor, each with its annual cost and the assumptions used to reach it.</li>
  <li><strong>90-day roadmap:</strong> what to implement first, what it integrates with, and how the result is measured.</li>
</ul>

<h3>Schedule</h3>
<ol>
  <li><strong>Day 1:</strong> workflow walks and tool inventory with the owner-operator present, then bottleneck scoring and review of the internal logic each process depends on.</li>
  <li><strong>Day 2:</strong> opportunity sizing and cost projections, the 90-day roadmap, and written delivery before we leave.</li>
</ol>

<h3>Terms</h3>
<p>The fee is credited in full against an implementation if the practice proceeds. If the review does not identify at least $5,000 in annual savings, it is refunded.</p>

<h3>Data handling</h3>
<p>The review is observational. Live customer records and transaction databases are not copied, duplicated or stored. An NDA is signed before the first day and covers every process, metric and conversation involved.</p>
    `,
    benefits: [
      'Fixed fee, no hourly billing and no obligation to implement',
      'Written report with three costed opportunities, delivered on the second day',
      'Refunded if annual savings of at least $5,000 are not identified',
      'Credited in full against an implementation',
      'Observational; NDA signed before the first day'
    ],
    pricing: '$500 (to $3,500 for multi-site operations)',
    isPublished: true,
    sortOrder: 1,
    seo: {
      title: 'AI Opportunity Audit — Generativ Consulting Company',
      description:
        'A two-day, on-site operational review documenting the three processes costing a practice the most, each with its annual cost and assumptions.',
      keywords: ['AI audit', 'AI opportunity audit', 'automation assessment', 'ROI guarantee']
    }
  },
  {
    slug: 'implementation-sprint',
    title: 'Implementation Sprint',
    shortDescription:
      'One automated process built end to end in 7 to 14 days and integrated with the systems already in use.',
    fullDescription: `
<p>An implementation of the first item on the roadmap: fixed price, fixed scope, delivered as a working system.</p>

<h3>Typical scopes</h3>
<ul>
  <li><strong>Lead intake, real estate:</strong> continuous monitoring of listing portals and web forms, qualification against stated criteria, and calendar booking. Target: first response under 60 seconds. Around $1,500, 7 to 10 days.</li>
  <li><strong>Patient intake and scheduling, medical and dental:</strong> mobile intake forms, validation, structured write-back, and text-based appointment management. Target: 8 to 12 staff hours recovered weekly. Around $2,500, 10 to 14 days, HIPAA-ready.</li>
  <li><strong>Document extraction, law and tax:</strong> parsing of client packets and case files, field extraction, and drafting behind an approval gate. Target: 80% reduction in intake processing time. Around $2,000, 10 days.</li>
</ul>

<h3>Integration</h3>
<p>The work includes the connection into the systems of record — CRM, EHR, billing, email — so the process completes rather than producing output for someone to re-enter.</p>

<h3>Handover</h3>
<p>Two weeks of handover with runbooks and training. The automation runs inside the tools the practice already uses; there is no separate application for staff to learn.</p>
    `,
    benefits: [
      'Fixed price, 50% on commencement',
      'Working system within 7 to 14 days',
      'Integrated with the existing CRM, EHR or billing systems',
      'Human approval gates on every critical action',
      'Two-week handover with runbooks and training'
    ],
    pricing: '$1,500 – $3,500 fixed price (50% upfront)',
    isPublished: true,
    sortOrder: 2,
    seo: {
      title: 'Implementation Sprint — Generativ Consulting Company',
      description:
        'One automated process built end to end in 7 to 14 days at a fixed price and integrated with existing systems.',
      keywords: ['automation sprint', 'AI implementation', 'speed to lead', 'patient intake automation']
    }
  },
  {
    slug: 'managed-operations',
    title: 'Managed Operations Retainer',
    shortDescription:
      'Monitoring, model versioning and pipeline tuning for deployed systems as the underlying models change.',
    fullDescription: `
<p>Foundation models change frequently. A process that was correct in March can be subtly wrong in September without anything failing visibly. The retainer covers the maintenance required to detect that.</p>

<h3>What is included</h3>
<ul>
  <li><strong>Model versioning:</strong> pinned versions, staged upgrades, and regression evaluation before anything reaches production.</li>
  <li><strong>Observability:</strong> traces that tie every non-deterministic decision back to the inputs that produced it.</li>
  <li><strong>Retrieval-pipeline tuning:</strong> keeping the retrieval layer honest as your documents, listings and records change.</li>
  <li><strong>Evaluation cycles:</strong> the eval pipelines that let a professional practice survive an audit or a disclosure requirement.</li>
</ul>

    `,
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
      'Red teaming, output validation and compliance controls for systems whose output is not deterministic.',
    fullDescription: `
<p>Before an automation is recommended on the basis of what it saves, its behavior when it is wrong has to be characterized. That work is included in every implementation and available separately for teams already running systems in production.</p>

<h3>Scope</h3>
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
    benefits: [
      'Hallucination risk characterized before deployment',
      'Reduced security and disclosure exposure',
      'Human approval gates on critical actions',
      'Evidence trails that hold up under a professional audit cycle'
    ],
    pricing: 'Included in implementation and retainer engagements; standalone assessments from $15,000',
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
      'Throughput engineering for document and intake pipelines that need to run at volume.',
    fullDescription: `
<p>Extraction measured in seconds per document is only useful if it can be run across the full archive. This is the engineering required to clear a backlog rather than process a queue.</p>

<h3>Where it shows up in an engagement</h3>
<ul>
  <li><strong>Batch document intelligence:</strong> years of physical case files, digitized and extracted in a single pass.</li>
  <li><strong>Continuous syncing:</strong> listings, records and billing states reconciled without a nightly job that never finishes.</li>
  <li><strong>Resource orchestration:</strong> intelligent allocation so cost tracks volume rather than headroom.</li>
  <li><strong>Performance monitoring:</strong> continuous evaluation and tuning as load changes.</li>
</ul>

<p>Available separately for teams running their own workloads, and applied wherever an implementation has to operate at scale.</p>
    `,
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
      'Training so that staff can operate and supervise automated processes without external support.',
    fullDescription: `
<p>Every implementation ends with a handover: runbooks, training, and the working knowledge to operate what was built. This service extends that into a standing capability, with the explicit aim of reducing dependence on outside consultants.</p>

<h3>What the programs cover</h3>
<ul>
  <li><strong>Approval-gate judgment:</strong> what to check before clicking Approve on an agent-drafted action.</li>
  <li><strong>Error recognition:</strong> spotting the subtle inaccuracies that look plausible and are not.</li>
  <li><strong>Prompt and instruction design:</strong> getting reliable behavior out of the tools your team already touches.</li>
  <li><strong>Output evaluation:</strong> systematic assessment of AI-generated content against the original objective.</li>
  <li><strong>Ethics and disclosure:</strong> what has to be told to a client, a patient, or a court.</li>
</ul>
    `,
    benefits: [
      'Staff able to operate approval gates without escalation',
      'Faster and more reliable error recognition',
      'Reduced dependence on external consultants',
      'Documented practice for disclosure obligations'
    ],
    pricing: 'Included with implementation handover; standalone workshops from $5,000',
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

const RETIRED_SERVICE_SLUGS = ['quick-win-sprint'];

// Slugs this module previously published and has since renamed. They are deleted
// on sync so a rename does not leave an orphaned copy behind at the old URL.
const RETIRED_BLOG_SLUGS = [
  'the-silent-leak-invisible-overhead',
  'speed-to-lead-12-minutes-to-12-seconds',
  'clinic-intake-and-the-no-show-problem',
  'document-intelligence-from-20-dollars-to-2-36',
  'why-40-percent-of-agentic-ai-projects-get-cancelled',
  'why-40-percent-of-agentic-ai-projects-get-canceled',
  'data-quality-is-85-percent-of-the-problem'
];

const daysAgo = (n: number) => new Date(Date.now() - n * 24 * 60 * 60 * 1000).toISOString();

const blogPosts: BlogSeed[] = [
  {
    slug: 'administrative-overhead-cost',
    title: 'What administrative overhead costs a small practice',
    content: `
<p>No line on a P&amp;L is labelled "invisible overhead". That is precisely what makes it expensive. The money leaves in amounts too small to trigger an alarm, on a schedule too regular to notice.</p>

<h2>Leak one: communication</h2>
<p><strong>42% of local businesses lose money to missed calls.</strong> For most of them the figure is over <strong>$500 a month</strong> — calls that arrived while the front desk was with someone else, after closing, or on a Saturday. Nobody logs a call that was never answered, so the loss never appears in a report. It appears as a quiet, permanent ceiling on new business.</p>

<h2>Leak two: operations</h2>
<p><strong>Manual document processing takes 10 to 30 minutes per file</strong>, which works out to <strong>$12 to $20 in labor per form</strong>. Intake sheets, ID cards, referral packets, tax documents — the same standard fields, extracted by hand, over and over. At a hundred forms a month that is a part-time salary spent on retyping.</p>

<h2>Leak three: latency</h2>
<p>The industry-standard first response to an inbound lead is around <strong>12 minutes</strong>. A renter browsing listings does not wait 12 minutes; they click the next result. The lead was never lost to a better offer. It was lost to a faster reply.</p>

<h2>Why this is worth auditing rather than guessing</h2>
<p>Each of these is individually small enough to rationalize and collectively large enough to matter. The purpose of a two-day, on-site audit is to convert them from a feeling into arithmetic: how many calls, how many forms, how many minutes, at what loaded labor rate. Once it is written down with assumptions you can check, it stops being overhead you tolerate and becomes a number you can decide about.</p>

<p>Each figure above is a published benchmark rather than a measurement of any particular practice. The point of costing them locally is that the local numbers are frequently different.</p>
    `,
    excerpt:
      'Missed calls, manual form processing, and lead response time, costed against published benchmarks.',
    author: 'Generativ Consulting Company',
    categories: ['Profit Leak', 'Operations'],
    tags: ['missed calls', 'document processing', 'speed to lead', 'overhead'],
    isPublished: true,
    publishedAt: daysAgo(2),
    seo: {
      title: 'What administrative overhead costs a small practice',
      description:
        'A costing of three common administrative losses: unanswered calls, manual form processing, and slow response to inbound inquiries.',
      keywords: ['profit leak', 'missed calls', 'manual data entry cost', 'small business overhead']
    }
  },
  {
    slug: 'response-time-and-lost-inquiries',
    title: 'Response time and lost inquiries in property management',
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

<h2>Whether it is worth building</h2>
<p>It depends entirely on inbound volume. A brokerage losing several fee-earning inquiries a month to slow follow-up recovers the build cost quickly; one with light or highly qualified inbound may not. Where volume is steady, reported payback is two to three weeks, with booking rates up around 20% in the first month.</p>

<h2>The limiting factor</h2>
<p>Response speed only helps if the qualification logic reflects how the agents actually work. That is the purpose of walking the real intake path with the person who runs it, including the exceptions that were never written down.</p>
    `,
    excerpt:
      'The industry benchmark for first response to a property inquiry is around 12 minutes. What automated qualification changes, and what it does not.',
    author: 'Generativ Consulting Company',
    categories: ['Real Estate', 'Automation'],
    tags: ['speed to lead', 'real estate', 'lead qualification', 'CRM integration'],
    isPublished: true,
    publishedAt: daysAgo(5),
    seo: {
      title: 'Response time and lost inquiries in property management',
      description:
        'How continuous inquiry intake and qualification affects response time, and the conditions under which it is worth building.',
      keywords: ['speed to lead', 'real estate automation', 'lead response time', 'StreetEasy automation']
    }
  },
  {
    slug: 'front-desk-hours-in-a-clinic',
    title: 'Where front-desk hours go in a small clinic',
    content: `
<p>A neighborhood clinic does not lose money dramatically. It loses it in eight to fifteen hours a week of front-desk time spent on phone tag, retyping paper intake forms into the EHR, and chasing past-due invoices.</p>

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

<h2>Compliance is the first constraint</h2>
<p>All of this touches PHI, so the architecture begins there: HIPAA-ready handling, isolated storage, role-based access, and no patient data used to train public models. A workflow that cannot pass review is not a saving.</p>
    `,
    excerpt:
      'Reminder calls, paper intake, and billing follow-up account for 8 to 15 hours a week in a typical practice. A breakdown of each.',
    author: 'Generativ Consulting Company',
    categories: ['Medical & Dental', 'Automation'],
    tags: ['patient intake', 'no-shows', 'HIPAA', 'scheduling automation'],
    isPublished: true,
    publishedAt: daysAgo(8),
    seo: {
      title: 'Where front-desk hours go in a small clinic',
      description:
        'A breakdown of administrative time in a small practice, and the compliance constraints on automating any of it.',
      keywords: ['patient intake automation', 'no-show reduction', 'HIPAA automation', 'dental practice automation']
    }
  },
  {
    slug: 'cost-of-manual-document-processing',
    title: 'The cost of manual document processing',
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

<h2>Realistic outcome</h2>
<p>Practices deploying this typically reduce case intake processing time by around <strong>80%</strong> and free roughly <strong>10 hours a week</strong> of administrative time, with fewer transcription errors than manual entry produces.</p>
    `,
    excerpt:
      'Manual extraction costs $12 to $20 per form and takes 10 to 30 minutes. What an automated pipeline changes, and what disclosure rules require of it.',
    author: 'Generativ Consulting Company',
    categories: ['Legal & Professional', 'Automation'],
    tags: ['document intelligence', 'legal automation', 'data extraction', 'AI disclosure'],
    isPublished: true,
    publishedAt: daysAgo(11),
    seo: {
      title: 'The cost of manual document processing',
      description:
        'Per-form processing costs in paperwork-dense practices, and the disclosure requirements that now shape any automated alternative.',
      keywords: ['document intelligence', 'legal AI', 'data extraction cost', 'AO 2.109-4/26']
    }
  },
  {
    slug: 'why-agentic-ai-projects-are-canceled',
    title: 'Why agentic AI projects are canceled',
    content: `
<p>Gartner's forecast is blunt: <strong>more than 40% of agentic AI projects are expected to be canceled by the end of 2027</strong>. Read alongside the adoption numbers, it is a stranger picture than it first appears.</p>

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
<p>Most canceled projects are a rebranded chatbot with an agent label. An agent is not a single model call wrapped in a UI. Real deployments need planning loops with retries, state that survives failure, a connector layer into the systems of record, and traces from every decision back to its inputs.</p>

<h2>Applying it</h2>
<p>Each opportunity identified in a review is assessed against five criteria before it is recommended: orchestration, governance, integration, observability, and outcomes — the last measured in resolution time and revenue rather than in systems deployed. An opportunity that fails one is not proposed. Canceling at that stage costs two days and a fixed fee rather than a quarter.</p>
    `,
    excerpt:
      'Gartner expects over 40% of agentic AI projects to be canceled by 2027 — from cost, unclear value and missing risk controls. The five tests that catch it early.',
    author: 'Generativ Consulting Company',
    categories: ['Agentic AI', 'Strategy'],
    tags: ['Gartner', 'agentic AI', 'project failure', 'governance', 'observability'],
    isPublished: true,
    publishedAt: daysAgo(14),
    seo: {
      title: 'Why agentic AI projects are canceled',
      description:
        'Gartner forecasts over 40% of agentic AI projects canceled by end of 2027. The recurring causes are cost, undefined value, and inadequate risk controls.',
      keywords: ['agentic AI failure', 'Gartner agentic AI', 'AI project cancellation', 'AI governance']
    }
  },
  {
    slug: 'data-quality-and-automation',
    title: 'Data quality as a precondition for automation',
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

<h2>Sequencing</h2>
<p>Reconciliation is unglamorous and it is the highest-leverage work available: it makes the automation reliable, it makes the reporting accurate, and it commonly surfaces billing that fell between two systems. In most practices the cleanup pays for itself before the first automated process is deployed.</p>

<p>This is why the readiness assessment grades infrastructure, data quality, and team capability before any implementation is scoped.</p>
    `,
    excerpt:
      'Roughly 85% of failed AI projects trace back to data quality. Duplicate records and unreconciled systems make agents hallucinate for entirely ordinary reasons.',
    author: 'Generativ Consulting Company',
    categories: ['Data Quality', 'Strategy'],
    tags: ['data quality', 'reconciliation', 'hallucination', 'readiness score'],
    isPublished: true,
    publishedAt: daysAgo(17),
    seo: {
      title: 'Data quality as a precondition for automation',
      description:
        'Data quality issues are implicated in around 85% of failed AI projects. Why reconciliation has to precede any automated process.',
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
        // `icon` is no longer set by the seed; updateService merges, so an
        // explicit empty value is required to clear a previously stored emoji.
        await updateService(match.id, { icon: '', ...seed });
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

async function deleteRetiredServices(): Promise<number> {
  const existing = await getAllServices();
  let removed = 0;

  for (const service of existing) {
    if (RETIRED_SERVICE_SLUGS.includes(service.slug)) {
      await deleteService(service.id);
      removed++;
    }
  }

  return removed;
}

async function deleteRetiredBlogPosts(): Promise<number> {
  const posts = await getAllBlogPosts();
  let removed = 0;

  for (const post of posts) {
    if (RETIRED_BLOG_SLUGS.includes(post.slug)) {
      await deleteBlogPost(post.id);
      removed++;
    }
  }

  return removed;
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
    tagline: PRIME_DIRECTIVE.summary,
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
          title: 'Engagements',
          links: [
            { text: 'AI Opportunity Audit', url: '/services/ai-opportunity-audit' },
            { text: 'Implementation Sprint', url: '/services/implementation-sprint' },
            { text: 'Managed Operations', url: '/services/managed-operations' }
          ]
        },
        {
          title: 'Practice',
          links: [
            { text: 'AI Safety Testing', url: '/services/safety-testing' },
            { text: 'Parallelization', url: '/services/parallelization' },
            { text: 'Critical Thinking', url: '/services/critical-thinking' }
          ]
        },
        {
          title: 'Company',
          links: [
            { text: 'About', url: '/about' },
            { text: 'Team', url: '/team' },
            { text: 'Writing', url: '/blog' },
            { text: 'Contact', url: '/contact' }
          ]
        }
      ]
    },
    analytics: current?.analytics || { enableCookieBanner: true },
    globalSEO: {
      title: 'Generativ Consulting Company',
      description:
        'Operational review and automation implementation for professional practices in real estate, healthcare and law.',
      keywords: [
        'AI opportunity audit',
        'operational review',
        'workflow automation',
        'document intelligence',
        'agentic AI',
        'AI consulting'
      ]
    }
  };

  await saveSiteSettings(next);
}

/**
 * Apply the prime directive to the CMS database. Safe to run repeatedly.
 */

// ---------------------------------------------------------------------------
// The people delivering the work. Matched on `name`, which is what the public
// profile URL (/team/:slug) is derived from on the client.
// ---------------------------------------------------------------------------

const teamMembers: TeamSeed[] = [
  {
    name: '34r7h',
    position: 'Engineering Lead',
    bio:
      'Fifteen years building generators — programs whose output is other programs. Code ' +
      'generators, content pipelines, scaffolding tools, and the compilers and template ' +
      'engines underneath them; the recurring problem in all of it is the same one, which is ' +
      'knowing which decisions belong to the generator and which belong to the thing being ' +
      'generated. Get that boundary wrong and every change costs twice.\n\n' +
      'Works the full depth of the stack rather than a layer of it. At the bottom: memory ' +
      'layout, binary formats, protocol behavior, and the profiling needed to find out where ' +
      'time is actually spent rather than where it is assumed to be spent. In the middle: data ' +
      'modelling, storage engines, queueing and the failure semantics that decide whether a ' +
      'system degrades or falls over. At the top: interfaces, deployment, and the operational ' +
      'tooling that determines whether anyone can run the thing on a Tuesday afternoon.\n\n' +
      'On engagements this shows up as diagnosis before construction. Most performance ' +
      'problems presented as scaling problems are a data model applied at the wrong layer, and ' +
      'most integration problems are two systems disagreeing about what a record means. Both ' +
      'are cheaper to find in the review than to discover after a build. What gets written is ' +
      'deliberately plain: readable code, few dependencies, and no framework that has to be ' +
      'learned by whoever inherits it.',
    expertise: [
      'Programming',
      'Generative Systems',
      'Systems Programming',
      'Full-Stack Architecture',
      'Performance Engineering',
      'Developer Tooling'
    ],
    email: '',
    linkedIn: '',
    userId: '',
    sortOrder: 3,
    isActive: true
  },
  {
    name: 'Empyrean',
    position: 'Visual Lead',
    bio:
      'Storyboards for film and advertising: sequence, framing, staging and pacing worked out ' +
      'on paper before a single asset is produced. A board is a cheap place to be wrong — a ' +
      'shot that does not read at thumbnail size will not read at full resolution either, and ' +
      'finding that out in pencil costs an afternoon rather than a production day.\n\n' +
      'Builds the generative pipelines that carry those boards into finished assets: ComfyUI ' +
      'graphs and the surrounding tooling, with controlled conditioning, reference and pose ' +
      'control, consistent characters across shots, upscaling and compositing passes, and ' +
      'seeds and parameters recorded so a frame can be reproduced exactly weeks later. The ' +
      'discipline that separates a usable pipeline from a slot machine is reproducibility: one ' +
      'striking image nobody can generate twice is a screenshot, not a deliverable.\n\n' +
      'The working method keeps direction upstream of generation. The board sets the shot; the ' +
      'pipeline renders it faithfully; anything the model contributes that the board did not ' +
      'ask for is reviewed rather than accepted. That order also settles the questions clients ' +
      'ask about provenance and revision — when the intent is documented and the parameters ' +
      'are recorded, a change request is a re-render rather than a fresh roll of the dice.',
    expertise: [
      'Multimedia Generation',
      'Storyboarding',
      'Film and Advertising',
      'ComfyUI Workflows',
      'Generative Asset Pipelines',
      'Art Direction'
    ],
    email: '',
    linkedIn: '',
    userId: '',
    sortOrder: 4,
    isActive: true
  },
  {
    name: 'Jayesh',
    position: 'Enterprise Automation Lead',
    bio:
      'Works on the systems a practice already runs — CRM, ERP, practice management, the ' +
      'billing platform, and the reporting layered over all of them — and on the automation ' +
      'that connects them. In most offices these were adopted years apart by different people ' +
      'for different reasons, and the seams between them are where administrative time ' +
      'quietly goes.\n\n' +
      'Engagements usually run in that order. First reconciliation: identifying where two ' +
      'systems disagree about the same customer, matching records, and measuring the ' +
      'duplication rate rather than assuming it. Then robotic process automation for the ' +
      'repetitive paths through those systems — the re-keying, the status updates, the ' +
      'exports that someone assembles by hand every Friday. Then the analytics layer, once ' +
      'the numbers underneath it can be trusted.\n\n' +
      'The sequence is not negotiable. A dashboard built over duplicate records is confidently ' +
      'wrong, and an agent automating a process nobody has written down will automate the ' +
      'exceptions along with the rule. Every integration ships with the boring parts attached: ' +
      'credentials held by the practice rather than an individual, rate limits and costs known ' +
      'in advance, a logged trail of every automated action, and a manual fallback that has ' +
      'actually been exercised.',
    expertise: [
      'CRM Integration',
      'ERP Systems',
      'Robotic Process Automation',
      'Data Reconciliation',
      'Systems Integration',
      'Analytics'
    ],
    email: '',
    linkedIn: '',
    userId: '',
    sortOrder: 1,
    isActive: true
  },
  {
    name: 'Helen',
    position: 'Product and Training Lead',
    bio:
      'Responsible for two things that are really one: what gets built, and whether the people ' +
      'using it can operate it after we leave. Scopes each implementation down to the ' +
      'narrowest version that still answers the question it was commissioned to answer — most ' +
      'proposals arrive wider than the problem, and the width is where budgets and timelines ' +
      'go.\n\n' +
      'A data science background sets the standard for what counts as working. A correct ' +
      'output has to be defined precisely enough that two reviewers independently agree on it; ' +
      'until that exists there is no error rate, only impressions. From there: baselines ' +
      'measured before the build rather than reconstructed after it, evaluation sets drawn ' +
      'from the practice\'s own historical cases, and monitoring that reports drift in terms ' +
      'the office already understands.\n\n' +
      'The training half is written for the people who will actually run the system — front ' +
      'desk staff, case managers, whoever is on shift. Approval-gate judgment: which decisions ' +
      'a person must still make. Error recognition: what a wrong output looks like before it ' +
      'reaches a client. Disclosure practice: what has to be said, to whom, and when. A system ' +
      'nobody on the team can supervise is not finished, whatever its accuracy on a test set.',
    expertise: [
      'Product Design',
      'Data Science',
      'Evaluation and Measurement',
      'Training',
      'Process Documentation',
      'Change Management',
      'AI Literacy'
    ],
    email: '',
    linkedIn: '',
    userId: '',
    sortOrder: 2,
    isActive: true
  }
];

async function upsertTeamMembers(): Promise<{ created: number; updated: number }> {
  const existing = await getAllTeamMembers();
  let created = 0;
  let updated = 0;

  for (const seed of teamMembers) {
    const matches = existing.filter(
      m => m.name.trim().toLowerCase() === seed.name.trim().toLowerCase()
    );
    if (matches.length === 0) {
      await createTeamMember(seed);
      created++;
    } else {
      for (const match of matches) {
        await updateTeamMember(match.id, seed);
        updated++;
      }
    }
  }

  return { created, updated };
}

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

  const teamResult = await upsertTeamMembers();
  console.log(`  team members: ${teamResult.created} created, ${teamResult.updated} updated`);

  const removedServices = await deleteRetiredServices();
  const removedPosts = await deleteRetiredBlogPosts();
  console.log(`  retired entries removed: ${removedServices} services, ${removedPosts} posts`);

  const repaired = await repairBlogBylines();
  console.log(`  placeholder bylines repaired: ${repaired}`);

  console.log('Prime directive applied.');
}
