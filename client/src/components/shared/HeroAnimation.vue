<script setup>
/**
 * The hero graphic: the three stages of an engagement.
 *
 * Review, build, operate — the same order the services page lists them in,
 * with the shape of each stated underneath. It restates the offer plainly
 * rather than illustrating an idea about it.
 *
 * Motion is a single quiet draw-in, once, then it rests. CSS on SVG nodes
 * only: no JavaScript, no loop running beside the copy.
 */
</script>

<template>
  <svg
    class="hero-anim"
    viewBox="0 0 440 296"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-label="Three stages of an engagement: review, build, operate"
  >
    <path class="spine" d="M40 58 V 234" />

    <g class="stage stage-1">
      <circle class="node" cx="40" cy="58" r="9" />
      <text class="stage-name" x="74" y="52">Review</text>
      <text class="stage-note" x="74" y="76">Two days on site. Three costed opportunities.</text>
    </g>

    <g class="stage stage-2">
      <circle class="node" cx="40" cy="146" r="9" />
      <text class="stage-name" x="74" y="140">Build</text>
      <text class="stage-note" x="74" y="164">One process automated end to end, in your own tools.</text>
    </g>

    <g class="stage stage-3">
      <circle class="node" cx="40" cy="234" r="9" />
      <text class="stage-name" x="74" y="228">Operate</text>
      <text class="stage-note" x="74" y="252">Monitored and maintained as the models change.</text>
    </g>
  </svg>
</template>

<style scoped>
.hero-anim {
  display: block;
  width: 100%;
  height: auto;
  max-width: 470px;
  font-family: var(--font-sans, 'Inter', system-ui, sans-serif);
}

.spine {
  fill: none;
  stroke: var(--primary-color, #4c6fff);
  stroke-width: 2;
  opacity: 0.28;
  stroke-dasharray: 180;
  stroke-dashoffset: 180;
  animation: draw 0.9s ease-out 0.15s both;
}

.node {
  fill: var(--primary-color, #4c6fff);
  transform-box: fill-box;
  transform-origin: center;
  transform: scale(0.3);
  opacity: 0;
  animation: pop 0.45s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.stage-name {
  font-size: 19px;
  font-weight: 700;
  fill: var(--dark-blue, #1e3a8a);
  opacity: 0;
  animation: fade 0.45s ease-out both;
}

.stage-note {
  font-size: 13px;
  fill: var(--light-text, #718096);
  opacity: 0;
  animation: fade 0.45s ease-out both;
}

.stage-1 .node { animation-delay: 0.3s; }
.stage-2 .node { animation-delay: 0.62s; }
.stage-3 .node { animation-delay: 0.94s; }

.stage-1 .stage-name, .stage-1 .stage-note { animation-delay: 0.42s; }
.stage-2 .stage-name, .stage-2 .stage-note { animation-delay: 0.74s; }
.stage-3 .stage-name, .stage-3 .stage-note { animation-delay: 1.06s; }

@keyframes draw { to { stroke-dashoffset: 0; } }
@keyframes pop { to { transform: scale(1); opacity: 1; } }
@keyframes fade { to { opacity: 1; } }

@media (prefers-reduced-motion: reduce) {
  .spine { animation: none; stroke-dashoffset: 0; }
  .node { animation: none; transform: scale(1); opacity: 1; }
  .stage-name, .stage-note { animation: none; opacity: 1; }
}
</style>
