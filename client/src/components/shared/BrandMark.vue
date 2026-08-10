<script setup>
/**
 * The Generativ wordmark.
 *
 * No symbol. The name is set in one typeface and shifts from light to heavy
 * across itself — thin input on the left, dense output on the right — so the
 * idea is carried by the letterforms rather than by a glyph sitting next to
 * them. Nothing here can render badly at small size, and there is no second
 * asset to keep in sync.
 *
 * `tone="dark"` inverts it for dark surfaces.
 */
defineProps({
  size: { type: String, default: 'md' },
  tone: { type: String, default: 'light' }
});
</script>

<template>
  <span class="brand-word" :class="[`tone-${tone}`, `size-${size}`]">
    <span class="w-light">Gener</span><span class="w-heavy">ativ</span>
  </span>
</template>

<style scoped>
.brand-word {
  display: inline-block;
  font-family: var(--font-sans, 'Inter', system-ui, sans-serif);
  letter-spacing: -0.04em;
  line-height: 1;
  white-space: nowrap;
  color: var(--dark-blue, #1e3a8a);
}

.w-light {
  font-weight: 300;
}

.w-heavy {
  font-weight: 800;
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
