<script setup>
/**
 * Illustrated portraits for the team.
 *
 * Flat vector, drawn on the same 200x200 grid and the same palette as the rest
 * of the brand, so a row of them reads as one set. Each person gets their own
 * silhouette — hair, build, and the one object they actually work with — and
 * nothing else; the differentiation is in craft, not in costume.
 *
 * A member with a real photo should render the photo instead; this is what the
 * team pages fall back to, replacing the generic grey placeholder figure.
 */
import { computed } from 'vue';

const props = defineProps({
  slug: { type: String, default: '' },
  name: { type: String, default: '' },
  size: { type: [Number, String], default: 150 }
});

const KNOWN = ['34r7h', 'empyrean', 'jayesh', 'helen'];
const variant = computed(() => (KNOWN.includes(props.slug) ? props.slug : 'generic'));
</script>

<template>
  <svg
    class="avatar-portrait"
    :width="size"
    :height="size"
    viewBox="0 0 200 200"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    :aria-label="name ? `Illustrated portrait of ${name}` : 'Illustrated portrait'"
  >
    <title v-if="name">{{ name }}</title>
    <circle cx="100" cy="100" r="100" class="a-ground" />

    <!-- 34r7h — engineering. Headphones, glasses, terminal on the shoulder. -->
    <g v-if="variant === '34r7h'">
      <path d="M46 200v-18a34 34 0 0 1 34-34h40a34 34 0 0 1 34 34v18Z" class="a-shirt-slate" />
      <path d="M84 140h32v22H84z" class="a-skin-tan" />
      <path d="M100 148a42 42 0 0 0 42-42V88a42 42 0 0 0-84 0v18a42 42 0 0 0 42 42Z" class="a-skin-tan" />
      <path d="M58 92V84a42 42 0 0 1 84 0v8c-6-20-18-28-42-28S64 72 58 92Z" class="a-hair-dark" />
      <path d="M62 60c8-16 22-24 38-24s30 8 38 24c-10-10-22-15-38-15s-28 5-38 15Z" class="a-hair-dark" />
      <!-- glasses -->
      <g class="a-glass">
        <rect x="68" y="92" width="26" height="20" rx="5" />
        <rect x="106" y="92" width="26" height="20" rx="5" />
        <path d="M94 101h12" />
        <path d="M68 99H58M132 99h10" />
      </g>
      <!-- headphones -->
      <path d="M54 100V88a46 46 0 0 1 92 0v12" class="a-band" />
      <rect x="44" y="94" width="16" height="28" rx="7" class="a-cup" />
      <rect x="140" y="94" width="16" height="28" rx="7" class="a-cup" />
      <!-- terminal, kept inside the circular crop -->
      <rect x="22" y="140" width="50" height="34" rx="5" class="a-screen" />
      <path d="M30 152l7 6-7 6M43 164h18" class="a-prompt" />
    </g>

    <!-- Empyrean — visual. Sharp bob, statement frames, storyboard panels. -->
    <g v-else-if="variant === 'empyrean'">
      <path d="M46 200v-18a34 34 0 0 1 34-34h40a34 34 0 0 1 34 34v18Z" class="a-shirt-ink" />
      <path d="M84 140h32v22H84z" class="a-skin-light" />
      <path d="M100 148a40 40 0 0 0 40-40V88a40 40 0 0 0-80 0v20a40 40 0 0 0 40 40Z" class="a-skin-light" />
      <!-- asymmetric bob -->
      <path d="M60 108V86a40 40 0 0 1 80 0v22l8 26h-22l-6-58c-14 8-38 8-52-2v34l-6 26H50Z" class="a-hair-plum" />
      <path d="M100 42c22 0 40 16 40 36-10-18-24-26-40-26s-30 8-40 26c0-20 18-36 40-36Z" class="a-hair-plum" />
      <!-- frames -->
      <g class="a-glass-bold">
        <rect x="66" y="92" width="28" height="18" rx="9" />
        <rect x="106" y="92" width="28" height="18" rx="9" />
        <path d="M94 101h12" />
      </g>
      <!-- storyboard panels, kept inside the circular crop -->
      <rect x="20" y="142" width="32" height="24" rx="3" class="a-panel" />
      <rect x="56" y="142" width="32" height="24" rx="3" class="a-panel" />
      <path d="M26 160l7-8 5 5 5-5 6 8" class="a-panel-line" />
      <path d="M62 152h20M62 159h13" class="a-panel-line" />
    </g>

    <!-- Jayesh — enterprise automation. Collared shirt, connected systems. -->
    <g v-else-if="variant === 'jayesh'">
      <path d="M46 200v-18a34 34 0 0 1 34-34h40a34 34 0 0 1 34 34v18Z" class="a-shirt-blue" />
      <path d="M100 148 86 160l6 40h16l6-40Z" class="a-collar" />
      <path d="M84 140h32v20H84z" class="a-skin-deep" />
      <path d="M100 148a41 41 0 0 0 41-41V90a41 41 0 0 0-82 0v17a41 41 0 0 0 41 41Z" class="a-skin-deep" />
      <path d="M59 94V86a41 41 0 0 1 82 0v8c-5-19-14-30-25-26-9 3-16 6-28 4S64 76 59 94Z" class="a-hair-black" />
      <!-- trimmed beard -->
      <path d="M70 112c2 20 14 34 30 34s28-14 30-34c-4 18-16 26-30 26s-26-8-30-26Z" class="a-hair-black" />
      <!-- systems reconciled into one, kept inside the circular crop -->
      <g class="a-wire">
        <path d="M36 146h10a7 7 0 0 1 7 7v3" />
        <path d="M36 168h10a7 7 0 0 0 7-7v-3" />
      </g>
      <rect x="18" y="138" width="18" height="16" rx="3" class="a-node" />
      <rect x="18" y="160" width="18" height="16" rx="3" class="a-node" />
      <rect x="53" y="147" width="20" height="20" rx="4" class="a-node-out" />
    </g>

    <!-- Helen — data science. Tied-back hair, plotted distribution. -->
    <g v-else-if="variant === 'helen'">
      <path d="M46 200v-18a34 34 0 0 1 34-34h40a34 34 0 0 1 34 34v18Z" class="a-shirt-teal" />
      <path d="M84 140h32v22H84z" class="a-skin-warm" />
      <path d="M100 148a40 40 0 0 0 40-40V88a40 40 0 0 0-80 0v20a40 40 0 0 0 40 40Z" class="a-skin-warm" />
      <!-- pulled back, with a bun -->
      <path d="M60 100V86a40 40 0 0 1 80 0v14c-6-16-10-24-40-24s-34 8-40 24Z" class="a-hair-auburn" />
      <circle cx="152" cy="74" r="14" class="a-hair-auburn" />
      <path d="M138 78c6-4 10-4 14-4" class="a-hair-line" />
      <!-- distribution plot, kept inside the circular crop -->
      <path d="M22 172h58" class="a-axis" />
      <path d="M22 169c10 0 13-28 29-28s19 28 29 28" class="a-curve" />
      <path d="M51 141v28" class="a-mean" />
    </g>

    <!-- Anyone else — the same construction, no distinguishing detail. -->
    <g v-else>
      <path d="M46 200v-18a34 34 0 0 1 34-34h40a34 34 0 0 1 34 34v18Z" class="a-shirt-slate" />
      <path d="M84 140h32v22H84z" class="a-skin-neutral" />
      <path d="M100 148a40 40 0 0 0 40-40V90a40 40 0 0 0-80 0v18a40 40 0 0 0 40 40Z" class="a-skin-neutral" />
      <path d="M60 96V88a40 40 0 0 1 80 0v8c-6-18-18-26-40-26S66 78 60 96Z" class="a-hair-neutral" />
    </g>
  </svg>
</template>

<style scoped>
.avatar-portrait {
  display: block;
  width: 100%;
  height: 100%;
}

/* Ground */
.a-ground { fill: #e8eefc; }

/* Skin — four distinct tones, all fully saturated flat fills */
.a-skin-tan { fill: #e8b48c; }
.a-skin-light { fill: #f0cdb4; }
.a-skin-deep { fill: #a9683f; }
.a-skin-warm { fill: #d9a077; }
.a-skin-neutral { fill: #cbd5e1; }

/* Hair */
.a-hair-dark { fill: #2f3a4d; }
.a-hair-plum { fill: #4b2350; }
.a-hair-black { fill: #1b1b22; }
.a-hair-auburn { fill: #7a3d20; }
.a-hair-neutral { fill: #94a3b8; }
.a-hair-line { fill: none; stroke: #5c2c17; stroke-width: 3; stroke-linecap: round; }

/* Clothing */
.a-shirt-slate { fill: #334155; }
.a-shirt-ink { fill: #17151f; }
.a-shirt-blue { fill: #1e3a8a; }
.a-shirt-teal { fill: #0f766e; }
.a-collar { fill: #f8fafc; }

/* Eyewear */
.a-glass {
  fill: none;
  stroke: #1f2937;
  stroke-width: 3;
  stroke-linecap: round;
}

.a-glass-bold {
  fill: none;
  stroke: #f8fafc;
  stroke-width: 4;
  stroke-linecap: round;
}

/* 34r7h */
.a-band { fill: none; stroke: #1f2937; stroke-width: 6; stroke-linecap: round; }
.a-cup { fill: #1f2937; }
.a-screen { fill: #111827; }
.a-prompt { fill: none; stroke: #34d399; stroke-width: 3; stroke-linecap: round; stroke-linejoin: round; }

/* Empyrean */
.a-panel { fill: #f8fafc; stroke: #17151f; stroke-width: 2.5; }
.a-panel-line { fill: none; stroke: #6b7280; stroke-width: 2.5; stroke-linecap: round; stroke-linejoin: round; }

/* Jayesh */
.a-wire { fill: none; stroke: #93b4fb; stroke-width: 3; stroke-linecap: round; }
.a-node { fill: #3b82f6; }
.a-node-out { fill: #10b981; }

/* Helen */
.a-axis { fill: none; stroke: #64748b; stroke-width: 3; stroke-linecap: round; }
.a-curve { fill: none; stroke: #0f766e; stroke-width: 4; stroke-linecap: round; stroke-linejoin: round; }
.a-mean { fill: none; stroke: #f59e0b; stroke-width: 3; stroke-dasharray: 5 5; stroke-linecap: round; }
</style>
