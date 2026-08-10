<script setup>
/**
 * The Generativ mark and wordmark lockup.
 *
 * The mark reads as generative building: one solid seed square at the origin,
 * then the same square reproduced outward at increasing scale and decreasing
 * weight — a rule applied repeatedly rather than a drawing of a thing. The
 * final unit closes back into solid form, because the output of the process is
 * something built, not a diagram of it.
 *
 * Flat fills and strokes only; the mark inherits `currentColor` for the
 * wordmark, so it works on light and dark surfaces without a second asset.
 */
defineProps({
  // 'full' — mark plus wordmark. 'mark' — the glyph alone, for tight spaces.
  variant: { type: String, default: 'full' },
  size: { type: [Number, String], default: 34 },
  // 'dark' inverts the mark's ink for placement on dark surfaces.
  tone: { type: String, default: 'light' }
});
</script>

<template>
  <span class="brand-lockup" :class="`tone-${tone}`">
    <svg
      class="brand-mark"
      :width="size"
      :height="size"
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Generativ"
    >
      <!-- the seed -->
      <rect x="4" y="24" width="12" height="12" rx="2.5" class="m-seed" />
      <!-- the rule, applied twice -->
      <rect x="19" y="14" width="17" height="17" rx="3" class="m-step" />
      <rect x="14" y="4" width="22" height="22" rx="3.5" class="m-step m-step-far" />
      <!-- the built result -->
      <rect x="24" y="14" width="12" height="12" rx="2.5" class="m-built" />
    </svg>
    <span v-if="variant === 'full'" class="brand-word">Generativ</span>
  </span>
</template>

<style scoped>
.brand-lockup {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  line-height: 1;
}

.brand-word {
  font-family: var(--font-display, 'Clash Display', sans-serif);
  font-weight: 700;
  font-size: 1.6rem;
  letter-spacing: -0.03em;
  color: var(--primary, #3b82f6);
}

.brand-mark {
  flex-shrink: 0;
}

.m-seed { fill: #3b82f6; }
.m-built { fill: #10b981; }
.m-step {
  fill: none;
  stroke: #1e3a8a;
  stroke-width: 2.5;
}

.m-step-far {
  stroke: #93b4fb;
}

/* On dark surfaces the outline steps need to lift off the ground, and the
   wordmark takes the surrounding foreground rather than brand blue. */
.tone-dark .m-step { stroke: #ffffff; }
.tone-dark .m-step-far { stroke: rgba(255, 255, 255, 0.45); }
.tone-dark .brand-word { color: #ffffff; }

@media (max-width: 480px) {
  .brand-word {
    font-size: 1.35rem;
  }
}
</style>
