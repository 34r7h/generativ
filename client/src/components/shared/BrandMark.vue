<script setup>
/**
 * The Generativ mark.
 *
 * A G assembled from identical square units on a 5x5 grid — the letterform is
 * not drawn, it is built out of one repeated part, which is the whole claim of
 * the name. The two units forming the crossbar are emerald: the piece the
 * process produces, distinguished from the structure that produced it.
 *
 * Modular construction survives scale. At 16px it reads as a solid blocky G;
 * at 120px the grid is legible and the crossbar reads as a separate act.
 */
import { computed } from 'vue';

defineProps({
  // 'full' — mark plus wordmark. 'mark' — the glyph alone, for tight spaces.
  variant: { type: String, default: 'full' },
  size: { type: [Number, String], default: 34 },
  // 'dark' inverts the structural ink for placement on dark surfaces.
  tone: { type: String, default: 'light' }
});

// Column/row coordinates on the 5x5 grid, read top-left to bottom-right.
const STRUCTURE = [
  [1, 0], [2, 0], [3, 0],
  [0, 1],
  [0, 2],
  [0, 3], [3, 3],
  [1, 4], [2, 4], [3, 4]
];

// The crossbar — what the structure generates.
const OUTPUT = [[2, 2], [3, 2]];

const STEP = 8;
const UNIT = 7;

const structure = computed(() => STRUCTURE.map(([x, y]) => ({ x: x * STEP, y: y * STEP })));
const output = computed(() => OUTPUT.map(([x, y]) => ({ x: x * STEP, y: y * STEP })));
</script>

<template>
  <span class="brand-lockup" :class="`tone-${tone}`">
    <svg
      class="brand-mark"
      :width="size"
      :height="size"
      viewBox="0 0 39 39"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Generativ"
    >
      <rect
        v-for="(cell, i) in structure"
        :key="`s${i}`"
        :x="cell.x"
        :y="cell.y"
        :width="UNIT"
        :height="UNIT"
        rx="1.6"
        class="m-unit"
      />
      <rect
        v-for="(cell, i) in output"
        :key="`o${i}`"
        :x="cell.x"
        :y="cell.y"
        :width="UNIT"
        :height="UNIT"
        rx="1.6"
        class="m-output"
      />
    </svg>
    <span v-if="variant === 'full'" class="brand-word">Generativ</span>
  </span>
</template>

<style scoped>
.brand-lockup {
  display: inline-flex;
  align-items: center;
  gap: 11px;
  line-height: 1;
}

.brand-mark {
  flex-shrink: 0;
}

.brand-word {
  font-family: var(--font-display, 'Clash Display', sans-serif);
  font-weight: 700;
  font-size: 1.6rem;
  letter-spacing: -0.03em;
  color: var(--dark-blue, #1e3a8a);
}

.m-unit { fill: #1e3a8a; }
.m-output { fill: #10b981; }

.tone-dark .m-unit { fill: #ffffff; }
.tone-dark .brand-word { color: #ffffff; }

@media (max-width: 480px) {
  .brand-word {
    font-size: 1.35rem;
  }
}
</style>
