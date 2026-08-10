/**
 * Icon selection for CMS-authored records.
 *
 * Services and verticals are stored without presentation, so the mark for a
 * card is derived from its title here rather than saved in the database. One
 * table, so every surface that renders a service picks the same icon.
 */

const SERVICE_ICONS = [
  [/audit|review|assess|diagnos/i, 'search'],
  [/implement|sprint|build|integration/i, 'workflow'],
  [/managed|operation|monitor|support/i, 'cpu'],
  [/safety|test|red team|compliance/i, 'shield'],
  [/parallel|performance|speed|scale/i, 'bolt'],
  [/training|thinking|education|literacy|enablement/i, 'brain'],
  [/data|analytic|report|intelligence/i, 'database'],
  [/product|design|roadmap/i, 'layers'],
  [/crm|erp|enterprise|automation|process/i, 'workflow']
];

const VERTICAL_ICONS = [
  [/real estate|propert|leasing/i, 'pin'],
  [/dental|medical|clinic|health|practice/i, 'shield'],
  [/law|legal|tax|account|professional/i, 'document']
];

function match(table, text, fallback) {
  const found = table.find(([pattern]) => pattern.test(text || ''));
  return found ? found[1] : fallback;
}

export function iconFor(text, fallback = 'layers') {
  return match(SERVICE_ICONS, text, fallback);
}

export function verticalIcon(title, fallback = 'layers') {
  return match(VERTICAL_ICONS, title, fallback);
}
