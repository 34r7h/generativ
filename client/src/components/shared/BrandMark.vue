<script setup>
/**
 * The Generativ wordmark.
 *
 * No symbol. The weight ramps letter by letter — thin input on the left,
 * dense output on the right — so the idea is carried by the letterforms
 * themselves. It is a per-character ramp rather than two blocks of weight:
 * with only two spans it read as a mistake, as though half the word had been
 * bolded by accident.
 *
 * This requires Inter's variable axis (wght@200..900, loaded in App.vue). With
 * a static weight list every step would snap to the nearest of five, which
 * collapses the ramp back into blocks.
 */
import { computed } from 'vue';

const props = defineProps({
  size: { type: String, default: 'md' },
  tone: { type: String, default: 'light' },
  from: { type: Number, default: 250 },
  to: { type: Number, default: 800 }
});

const NAME = 'Generativ';

const letters = computed(() =>
  NAME.split('').map((char, i) => ({
    char,
    key: `${char}-${i}`,
    weight: Math.round(props.from + (props.to - props.from) * (i / (NAME.length - 1)))
  }))
);
</script>

<template>
  <span class="brand-word" :class="[`tone-${tone}`, `size-${size}`]" :aria-label="NAME" role="img">
    <span
      v-for="letter in letters"
      :key="letter.key"
      aria-hidden="true"
      :style="{ fontWeight: letter.weight, fontVariationSettings: `'wght' ${letter.weight}` }"
    >{{ letter.char }}</span>
  </span>
</template>

<style scoped>
.brand-word {
  display: inline-block;
  font-family: 'Inter', var(--font-sans, system-ui, sans-serif);
  letter-spacing: -0.035em;
  line-height: 1;
  white-space: nowrap;
  color: var(--dark-blue, #1e3a8a);
  /* Optical sizing keeps the light letters from thinning out at small sizes. */
  font-optical-sizing: auto;
}

.size-sm { font-size: 1.35rem; }
.size-md { font-size: 1.75rem; }
.size-lg { font-size: 2.4rem; }

.tone-dark {
  color: #ffffff;
}

@media (max-width: 480px) {
  .size-md { font-size: 1.4rem; }
  .size-lg { font-size: 1.8rem; }
}
</style>
