/**
 * Reports published on /resources.
 *
 * These are code-owned documents rather than CMS records: they are versioned
 * with the site, rendered in full at /resources/:slug, and downloaded as a
 * self-contained HTML file built from this same content — so what a reader
 * downloads is exactly what they were reading.
 *
 * House style, as with the blog: published benchmarks stated plainly, each one
 * attributed, with an explicit note that a benchmark is not a measurement of
 * any particular practice.
 */

export const REPORTS = [
  {
    slug: 'administrative-overhead-benchmark',
    title: 'Administrative Overhead Benchmark',
    type: 'Benchmark',
    icon: 'chart',
    category: 'reports',
    date: 'August 2026',
    readingTime: '8 min',
    summary:
      'The three administrative losses that recur in small professional practices — unanswered calls, manual form processing, and slow first response — costed against published benchmarks, with the arithmetic laid out so a practice can substitute its own numbers.',
    figures: [
      { value: '42%', label: 'of local businesses lose money to missed calls', source: 'Published small-business call-handling benchmark' },
      { value: '$12–$20', label: 'labor cost per manually processed form', source: 'Document-processing time studies, 10–30 min per file' },
      { value: '~12 min', label: 'industry-standard first response to an inbound lead', source: 'Speed-to-lead benchmark, property and services sectors' }
    ],
    sections: [
      {
        heading: 'What this document is',
        paragraphs: [
          'No line on a profit-and-loss statement is labelled invisible overhead. That is what makes it expensive: the money leaves in amounts too small to trigger an alarm, on a schedule too regular to notice.',
          'This benchmark collects the three losses that recur most often in practices of five to fifty people, states the published figure for each, and shows the arithmetic that converts the figure into an annual number. It is written so that every input can be replaced with a local measurement.'
        ]
      },
      {
        heading: 'Leak one — unanswered calls',
        paragraphs: [
          'Calls arrive while the front desk is with someone else, after closing, or on a Saturday. Nobody logs a call that was never answered, so the loss never appears in a report. It appears as a quiet ceiling on new business.'
        ],
        list: [
          'Inputs: calls received per week, share unanswered, share of answered calls that become clients, average first-year client value.',
          'Worked example: 60 calls a week, 20% unanswered, 25% of answered calls convert, $900 average value — 12 missed calls a week, 3 lost clients, roughly $140,000 a year at the stated conversion rate.',
          'The sensitivity that matters is conversion, not call volume. Measure conversion before trusting the total.'
        ]
      },
      {
        heading: 'Leak two — manual document processing',
        paragraphs: [
          'Intake sheets, identification cards, referral packets and tax documents carry the same standard fields, extracted by hand, repeatedly. At 10 to 30 minutes per file the labor cost lands between $12 and $20 per form.'
        ],
        list: [
          'Inputs: forms per month, minutes per form, loaded hourly rate of the person doing it.',
          'Worked example: 100 forms a month at 18 minutes and a $32 loaded rate — 30 hours a month, about $11,500 a year.',
          'Extraction accuracy sets the ceiling on what automation can claim: a pipeline that requires review of every output saves review time, not processing time.'
        ]
      },
      {
        heading: 'Leak three — response latency',
        paragraphs: [
          'The industry-standard first response to an inbound inquiry is around twelve minutes. A prospect comparing options does not wait twelve minutes. The inquiry is rarely lost to a better offer; it is lost to a faster reply.'
        ],
        list: [
          'Inputs: inbound inquiries per week, median first-response time, conversion at each response band.',
          'Continuous intake changes the median, not the quality of the lead. Qualification rules decide whether the faster reply is worth anything.',
          'Where response is already under five minutes, this leak is closed and the arithmetic should return zero. That result is a valid outcome of the review.'
        ]
      },
      {
        heading: 'How to use this',
        paragraphs: [
          'Replace each published figure with a local measurement taken over two weeks. Where a local number is unavailable, keep the benchmark and mark it as an assumption rather than a finding.',
          'Each figure above is a published benchmark rather than a measurement of any particular practice. The purpose of costing them locally is that local numbers are frequently different — often materially so.'
        ]
      }
    ]
  },
  {
    slug: 'automation-readiness-checklist',
    title: 'Automation Readiness Checklist',
    type: 'Checklist',
    icon: 'check',
    category: 'playbooks',
    date: 'August 2026',
    readingTime: '6 min',
    summary:
      'Twenty-four checks across data, process, systems, and oversight that determine whether a process can be automated at acceptable risk — scored, with the disqualifying conditions stated explicitly.',
    figures: [
      { value: '~85%', label: 'of failed AI projects implicate data quality', source: 'Published analyses of AI project failure' },
      { value: '4', label: 'readiness dimensions scored before any build', source: 'Generativ Consulting Company review method' }
    ],
    sections: [
      {
        heading: 'Scoring',
        paragraphs: [
          'Each item is scored 0 (absent), 1 (partial), or 2 (in place). A dimension is ready at 75% of its available points. Any item marked as disqualifying blocks the build regardless of total score.'
        ]
      },
      {
        heading: 'Data',
        list: [
          'A single system of record exists for the entities the process touches.',
          'Duplicate records are measured, and the duplication rate is known rather than assumed.',
          'Fields the process depends on are populated in at least 95% of records.',
          'Historic records reconcile with the current system without manual correction.',
          'Personal and health information is identified and its handling documented. Disqualifying if absent.',
          'An export exists that a third party could read without access to the live system.'
        ]
      },
      {
        heading: 'Process',
        list: [
          'The process is written down and the written version matches what people actually do.',
          'Exceptions are enumerated, with a stated frequency for each.',
          'A correct output is defined precisely enough that two reviewers agree on it.',
          'Volume is measured, not estimated.',
          'The process has an owner who can approve a change to it.',
          'A manual fallback exists and has been exercised in the last year.'
        ]
      },
      {
        heading: 'Systems',
        list: [
          'Each system in the path has an API or a supported export.',
          'Credentials are held by the practice rather than by an individual.',
          'Rate limits and quotas are known.',
          'A test environment exists, or a safe subset of live data can be used.',
          'Changes can be released without taking the practice offline.',
          'Costs scale predictably with volume, and the scaling curve is known.'
        ]
      },
      {
        heading: 'Oversight',
        list: [
          'Every automated action is logged with enough context to reconstruct it.',
          'An approval gate exists for actions that are expensive to reverse. Disqualifying if absent.',
          'Someone is accountable for reviewing output on a stated cadence.',
          'Error rates are measured against a defined correct output.',
          'Disclosure obligations to clients or regulators are identified. Disqualifying if unresolved.',
          'A rollback procedure is written and has been tested.'
        ]
      },
      {
        heading: 'Reading the result',
        paragraphs: [
          'A process that scores below 75% on data is not an automation problem; it is a reconciliation problem, and building on top of it produces confident wrong answers rather than errors that announce themselves.',
          'Roughly 85% of failed AI projects implicate data quality. That figure is the reason this checklist grades data before it grades anything else.'
        ]
      }
    ]
  },
  {
    slug: 'agentic-project-failure-modes',
    title: 'Agentic Project Failure Modes',
    type: 'Field Note',
    icon: 'alert',
    category: 'caseStudies',
    date: 'August 2026',
    readingTime: '7 min',
    summary:
      'Gartner expects more than 40% of agentic AI projects to be cancelled by the end of 2027. The recurring causes are cost, undefined value, and inadequate risk controls — with five tests that surface each one before a budget is committed.',
    figures: [
      { value: '>40%', label: 'of agentic AI projects expected to be cancelled by end of 2027', source: 'Gartner forecast' },
      { value: '5', label: 'tests applied before an implementation is scoped', source: 'Generativ Consulting Company review method' }
    ],
    sections: [
      {
        heading: 'The pattern',
        paragraphs: [
          'Cancelled projects rarely fail on capability. They fail because nobody agreed in advance what the system was worth, what it was allowed to do unsupervised, or who would notice when it was wrong.',
          'Each failure mode below has a test that can be applied in an afternoon, before a budget is committed.'
        ]
      },
      {
        heading: 'Failure mode one — undefined value',
        paragraphs: [
          'The project is justified by a capability rather than by a number. Test: state the saving or the gain in the units the practice already reports, with the inputs written down. If the sentence cannot be completed, the project is not ready to be scoped.'
        ]
      },
      {
        heading: 'Failure mode two — cost discovered late',
        paragraphs: [
          'Per-call costs are modelled on a demo volume and encountered at production volume. Test: multiply the per-unit cost by the highest month of the last two years, then double it. If that number changes the decision, it needed to be known first.'
        ]
      },
      {
        heading: 'Failure mode three — no defined correct output',
        paragraphs: [
          'Without a definition, error rate cannot be measured and the system cannot be said to be working. Test: take twenty historical cases, have two people independently mark the correct output, and compare. Disagreement above 10% means the specification, not the model, is the problem.'
        ]
      },
      {
        heading: 'Failure mode four — missing risk controls',
        paragraphs: [
          'Autonomous action without an approval gate converts an ordinary error into an external event. Test: list every action the system can take unsupervised and the cost of reversing each. Anything expensive to reverse belongs behind a gate.'
        ]
      },
      {
        heading: 'Failure mode five — no observability',
        paragraphs: [
          'A system nobody watches degrades silently. Test: name the person who reviews output, the cadence, and the threshold that triggers escalation. If any of the three is missing, the control does not exist.'
        ]
      },
      {
        heading: 'What survives',
        paragraphs: [
          'Projects that pass all five tests tend to be narrower than the ones proposed. That narrowing is the useful output of the exercise, not a concession.',
          'The forecast above is a published projection rather than a measurement of any particular programme. It is cited because the failure modes behind it are consistent and cheap to test for.'
        ]
      }
    ]
  }
];

export function findReport(slug) {
  return REPORTS.find((report) => report.slug === slug) || null;
}

export function reportsByCategory(category) {
  return REPORTS.filter((report) => report.category === category);
}

/**
 * Build the downloadable document. It is the same content the reader sees,
 * inlined into one standalone HTML file so it opens without the site, and
 * prints (or saves to PDF) from any browser.
 */
export function buildReportDocument(report) {
  const escape = (value) =>
    String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

  const figures = report.figures?.length
    ? `<section class="figures">${report.figures
        .map(
          (figure) => `<div class="figure">
        <div class="figure-value">${escape(figure.value)}</div>
        <div class="figure-label">${escape(figure.label)}</div>
        <div class="figure-source">${escape(figure.source)}</div>
      </div>`
        )
        .join('')}</section>`
    : '';

  const sections = report.sections
    .map((section) => {
      const paragraphs = (section.paragraphs || [])
        .map((text) => `<p>${escape(text)}</p>`)
        .join('');
      const list = section.list?.length
        ? `<ul>${section.list.map((item) => `<li>${escape(item)}</li>`).join('')}</ul>`
        : '';
      return `<section><h2>${escape(section.heading)}</h2>${paragraphs}${list}</section>`;
    })
    .join('');

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escape(report.title)} — Generativ Consulting Company</title>
<style>
  :root { color-scheme: light; }
  body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1f2937; background: #ffffff; margin: 0; line-height: 1.7; }
  .page { max-width: 720px; margin: 0 auto; padding: 56px 24px 72px; }
  .masthead { border-bottom: 3px solid #1e3a8a; padding-bottom: 20px; margin-bottom: 32px; }
  .brand { font-size: 0.85rem; letter-spacing: 0.08em; text-transform: uppercase; color: #4b5563; margin: 0 0 12px; }
  h1 { font-size: 2.1rem; line-height: 1.2; margin: 0 0 12px; color: #111827; }
  .meta { color: #4b5563; font-size: 0.95rem; margin: 0; }
  .summary { font-size: 1.1rem; color: #374151; margin: 28px 0 8px; }
  .figures { display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 16px; margin: 32px 0; }
  .figure { border: 1px solid #e5e7eb; border-radius: 10px; padding: 18px; }
  .figure-value { font-size: 1.7rem; font-weight: 700; color: #1e3a8a; }
  .figure-label { color: #374151; margin-top: 6px; }
  .figure-source { color: #6b7280; font-size: 0.82rem; margin-top: 10px; }
  h2 { font-size: 1.25rem; color: #111827; margin: 36px 0 12px; }
  ul { padding-left: 20px; }
  li { margin-bottom: 8px; }
  footer { margin-top: 48px; border-top: 1px solid #e5e7eb; padding-top: 20px; color: #6b7280; font-size: 0.85rem; }
  @media print { .page { padding: 0; max-width: none; } }
</style>
</head>
<body>
<div class="page">
  <header class="masthead">
    <p class="brand">Generativ Consulting Company</p>
    <h1>${escape(report.title)}</h1>
    <p class="meta">${escape(report.type)} &middot; ${escape(report.date)}</p>
  </header>
  <p class="summary">${escape(report.summary)}</p>
  ${figures}
  ${sections}
  <footer>
    <p>Published by Generativ Consulting Company. Figures cited are published benchmarks rather than measurements of any particular practice.</p>
    <p>generativ.cc &middot; ${escape(report.date)}</p>
  </footer>
</div>
</body>
</html>`;
}

export function downloadReport(report) {
  const blob = new Blob([buildReportDocument(report)], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${report.slug}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
