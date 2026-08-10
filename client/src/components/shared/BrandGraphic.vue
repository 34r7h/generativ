<script setup>
/**
 * Flat brand illustrations. Solid fills only — the design system forbids
 * gradients — drawn on a 400x300 grid so every variant crops identically.
 * Decorative by default: pass `label` only when the graphic carries meaning
 * the surrounding copy does not.
 */
defineProps({
  name: { type: String, required: true },
  label: { type: String, default: '' }
});
</script>

<template>
  <svg
    class="brand-graphic"
    viewBox="0 0 400 300"
    xmlns="http://www.w3.org/2000/svg"
    :aria-hidden="label ? undefined : 'true'"
    :role="label ? 'img' : undefined"
    :aria-label="label || undefined"
  >
    <title v-if="label">{{ label }}</title>

    <!-- The audit: five working days, three findings, the arithmetic behind each -->
    <g v-if="name === 'audit'">
      <rect x="24" y="40" width="352" height="220" rx="14" class="g-surface" />
      <rect x="24" y="40" width="352" height="34" rx="14" class="g-primary" />
      <rect x="24" y="60" width="352" height="14" class="g-primary" />
      <circle cx="46" cy="57" r="5" class="g-onprimary" />
      <circle cx="64" cy="57" r="5" class="g-onprimary" />
      <circle cx="82" cy="57" r="5" class="g-onprimary" />

      <!-- five day columns -->
      <g>
        <rect x="52" y="196" width="34" height="34" rx="5" class="g-muted" />
        <rect x="102" y="176" width="34" height="54" rx="5" class="g-muted" />
        <rect x="152" y="150" width="34" height="80" rx="5" class="g-primary" />
        <rect x="202" y="130" width="34" height="100" rx="5" class="g-primary" />
        <rect x="252" y="104" width="34" height="126" rx="5" class="g-accent" />
      </g>
      <path d="M52 244h234" class="g-rule" />

      <!-- three findings, ticked -->
      <g>
        <rect x="304" y="104" width="52" height="12" rx="6" class="g-muted" />
        <rect x="304" y="128" width="52" height="12" rx="6" class="g-muted" />
        <rect x="304" y="152" width="52" height="12" rx="6" class="g-muted" />
      </g>

      <!-- the review lens -->
      <circle cx="228" cy="128" r="46" class="g-lens" />
      <circle cx="228" cy="128" r="46" class="g-lens-ring" />
      <path d="m262 162 26 26" class="g-lens-handle" />
    </g>

    <!-- Enterprise automation: many systems in, one reconciled process out -->
    <g v-else-if="name === 'automation'">
      <g class="g-wire">
        <path d="M92 74h74a26 26 0 0 1 26 26v34" />
        <path d="M92 150h100" />
        <path d="M92 226h74a26 26 0 0 0 26-26v-34" />
        <path d="M244 150h64" />
      </g>

      <rect x="34" y="56" width="58" height="36" rx="7" class="g-primary" />
      <rect x="34" y="132" width="58" height="36" rx="7" class="g-primary" />
      <rect x="34" y="208" width="58" height="36" rx="7" class="g-primary" />

      <circle cx="192" cy="74" r="7" class="g-dot" />
      <circle cx="192" cy="150" r="7" class="g-dot" />
      <circle cx="192" cy="226" r="7" class="g-dot" />

      <path d="M218 106h52l26 44-26 44h-52l-26-44 26-44Z" class="g-dark" />
      <path d="m230 150 12 12 22-24" class="g-check" />

      <rect x="308" y="120" width="58" height="60" rx="8" class="g-accent" />
      <rect x="320" y="138" width="34" height="7" rx="3.5" class="g-onaccent" />
      <rect x="320" y="153" width="34" height="7" rx="3.5" class="g-onaccent" />
    </g>

    <!-- Product and training: a system, and the people running it -->
    <g v-else-if="name === 'training'">
      <rect x="46" y="46" width="230" height="150" rx="12" class="g-dark" />
      <rect x="62" y="66" width="198" height="110" rx="6" class="g-surface" />
      <rect x="78" y="84" width="86" height="12" rx="6" class="g-primary" />
      <rect x="78" y="108" width="140" height="8" rx="4" class="g-muted" />
      <rect x="78" y="126" width="118" height="8" rx="4" class="g-muted" />
      <rect x="78" y="146" width="62" height="14" rx="7" class="g-accent" />
      <path d="M132 196h58v14h-58z" class="g-dark" />
      <path d="M110 220h102" class="g-rule" />

      <g>
        <circle cx="300" cy="96" r="20" class="g-primary" />
        <path d="M270 158v-10a30 30 0 0 1 60 0v10Z" class="g-primary" />
        <circle cx="344" cy="140" r="15" class="g-accent" />
        <path d="M322 194v-8a22 22 0 0 1 44 0v8Z" class="g-accent" />
      </g>
    </g>

    <!-- A report: the document, and the figures inside it -->
    <g v-else-if="name === 'report'">
      <rect x="70" y="52" width="200" height="216" rx="12" class="g-muted" />
      <rect x="86" y="40" width="200" height="216" rx="12" class="g-surface" />
      <rect x="86" y="40" width="200" height="40" rx="12" class="g-dark" />
      <rect x="86" y="66" width="200" height="14" class="g-dark" />
      <rect x="106" y="54" width="86" height="12" rx="6" class="g-ondark" />

      <rect x="106" y="102" width="160" height="9" rx="4.5" class="g-muted" />
      <rect x="106" y="120" width="128" height="9" rx="4.5" class="g-muted" />

      <g>
        <rect x="106" y="184" width="26" height="44" rx="4" class="g-primary" />
        <rect x="144" y="164" width="26" height="64" rx="4" class="g-primary" />
        <rect x="182" y="200" width="26" height="28" rx="4" class="g-muted" />
        <rect x="220" y="148" width="26" height="80" rx="4" class="g-accent" />
      </g>
      <path d="M106 240h140" class="g-rule" />

      <circle cx="300" cy="212" r="34" class="g-primary" />
      <path d="M300 194v30" class="g-arrow" />
      <path d="m288 214 12 12 12-12" class="g-arrow" />
      <path d="M284 238h32" class="g-arrow" />
    </g>

    <!-- Where the time goes: a week of hours, and the share that is reclaimable -->
    <g v-else-if="name === 'leak'">
      <circle cx="150" cy="150" r="96" class="g-muted" />
      <path d="M150 54a96 96 0 0 1 83 144l-83-48Z" class="g-primary" />
      <path d="M150 54a96 96 0 0 0-96 96h96Z" class="g-accent" />
      <circle cx="150" cy="150" r="46" class="g-surface" />

      <rect x="278" y="88" width="14" height="14" rx="4" class="g-primary" />
      <rect x="304" y="90" width="70" height="10" rx="5" class="g-muted" />
      <rect x="278" y="128" width="14" height="14" rx="4" class="g-accent" />
      <rect x="304" y="130" width="58" height="10" rx="5" class="g-muted" />
      <rect x="278" y="168" width="14" height="14" rx="4" class="g-neutral" />
      <rect x="304" y="170" width="66" height="10" rx="5" class="g-muted" />
    </g>
  </svg>
</template>

<style scoped>
.brand-graphic {
  display: block;
  width: 100%;
  height: auto;
  max-width: 480px;
}

/* Solid fills only — no gradients anywhere in the brand. */
.g-surface { fill: #ffffff; }
.g-muted { fill: #e5e7eb; }
.g-neutral { fill: #9ca3af; }
.g-primary { fill: #3b82f6; }
.g-accent { fill: #10b981; }
.g-dark { fill: #1e3a8a; }
.g-onprimary { fill: #ffffff; }
.g-onaccent { fill: #ffffff; }
.g-ondark { fill: #ffffff; }
.g-dot { fill: #1e3a8a; }

.g-rule { stroke: #d1d5db; stroke-width: 3; stroke-linecap: round; }
.g-wire { fill: none; stroke: #9ca3af; stroke-width: 3; stroke-linecap: round; }
.g-check { fill: none; stroke: #ffffff; stroke-width: 5; stroke-linecap: round; stroke-linejoin: round; }
.g-arrow { fill: none; stroke: #ffffff; stroke-width: 4.5; stroke-linecap: round; stroke-linejoin: round; }
.g-lens { fill: #ffffff; fill-opacity: 0.28; }
.g-lens-ring { fill: none; stroke: #1e3a8a; stroke-width: 6; }
.g-lens-handle { fill: none; stroke: #1e3a8a; stroke-width: 10; stroke-linecap: round; }
</style>
