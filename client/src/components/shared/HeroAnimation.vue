<script setup>
/**
 * The hero graphic: the three stages of an engagement, drawn as a schematic.
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
    viewBox="0 0 468 330"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-label="Three stages of an engagement: review, build, operate"
  >
    <!-- Frame: a hairline plate the diagram sits on. -->
    <rect class="plate" x="0.5" y="0.5" width="467" height="329" rx="5" />

    <!-- Corner ticks -->
    <g class="ticks">
      <path d="M14 1 V 15 M1 14 H 15" />
      <path d="M454 1 V 15 M467 14 H 453" />
      <path d="M14 329 V 315 M1 316 H 15" />
      <path d="M454 329 V 315 M467 316 H 453" />
    </g>

    <text class="plate-label" x="26" y="34">ENGAGEMENT</text>
    <text class="plate-index" x="442" y="34">3 STAGES</text>

    <!-- Spine -->
    <path class="spine" d="M46 82 V 274" />

    <g class="stage stage-1">
      <circle class="halo" cx="46" cy="82" r="15" />
      <circle class="node" cx="46" cy="82" r="5.5" />
      <text class="stage-code" x="78" y="70">01</text>
      <text class="stage-name" x="108" y="70">Review</text>
      <text class="stage-note" x="78" y="94">Two days on site. Three costed opportunities.</text>
    </g>

    <g class="stage stage-2">
      <circle class="halo" cx="46" cy="178" r="15" />
      <circle class="node" cx="46" cy="178" r="5.5" />
      <text class="stage-code" x="78" y="166">02</text>
      <text class="stage-name" x="108" y="166">Build</text>
      <text class="stage-note" x="78" y="190">One process automated end to end, in your own tools.</text>
    </g>

    <g class="stage stage-3">
      <circle class="halo" cx="46" cy="274" r="15" />
      <circle class="node" cx="46" cy="274" r="5.5" />
      <text class="stage-code" x="78" y="262">03</text>
      <text class="stage-name" x="108" y="262">Operate</text>
      <text class="stage-note" x="78" y="286">Monitored and maintained as the models change.</text>
    </g>

    <!-- Measure rule along the bottom -->
    <g class="measure">
      <path d="M26 306 H 442" />
      <path d="M26 302 V 310 M234 302 V 310 M442 302 V 310" />
    </g>
  </svg>
</template>

<style scoped>
.hero-anim {
  display: block;
  width: 100%;
  height: auto;
  max-width: 480px;
  font-family: var(--g-font, 'Inter', system-ui, sans-serif);
}

.plate {
  fill: rgba(255, 255, 255, 0.014);
  stroke: var(--g-line, rgba(255, 255, 255, 0.09));
  stroke-width: 1;
}

.ticks path {
  fill: none;
  stroke: var(--g-line-2, rgba(255, 255, 255, 0.18));
  stroke-width: 1;
}

.plate-label,
.plate-index {
  font-family: var(--g-mono, monospace);
  font-size: 9.5px;
  letter-spacing: 1.6px;
  fill: var(--g-text-faint, #64646f);
}

.plate-index { text-anchor: end; }

.spine {
  fill: none;
  stroke: var(--g-line-2, rgba(255, 255, 255, 0.18));
  stroke-width: 1;
  stroke-dasharray: 196;
  stroke-dashoffset: 196;
  animation: draw 1s ease-out 0.15s both;
}

.halo {
  fill: none;
  stroke: var(--g-volt, #d6ff3e);
  stroke-width: 1;
  opacity: 0;
  transform-box: fill-box;
  transform-origin: center;
  transform: scale(0.5);
  animation: halo 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.node {
  fill: var(--g-volt, #d6ff3e);
  transform-box: fill-box;
  transform-origin: center;
  transform: scale(0.3);
  opacity: 0;
  animation: pop 0.45s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.stage-code {
  font-family: var(--g-mono, monospace);
  font-size: 10px;
  letter-spacing: 1px;
  fill: var(--g-volt, #d6ff3e);
  opacity: 0;
  animation: fade 0.5s ease-out both;
}

.stage-name {
  font-size: 19px;
  font-weight: 550;
  letter-spacing: -0.5px;
  fill: var(--g-text, #ededf0);
  opacity: 0;
  animation: fade 0.5s ease-out both;
}

.stage-note {
  font-size: 12.5px;
  fill: var(--g-text-dim, #9c9ca8);
  opacity: 0;
  animation: fade 0.5s ease-out both;
}

.measure path {
  fill: none;
  stroke: var(--g-line, rgba(255, 255, 255, 0.09));
  stroke-width: 1;
  opacity: 0;
  animation: fade 0.6s ease-out 1.3s both;
}

.stage-1 .node, .stage-1 .halo { animation-delay: 0.3s; }
.stage-2 .node, .stage-2 .halo { animation-delay: 0.62s; }
.stage-3 .node, .stage-3 .halo { animation-delay: 0.94s; }

.stage-1 .stage-code, .stage-1 .stage-name, .stage-1 .stage-note { animation-delay: 0.42s; }
.stage-2 .stage-code, .stage-2 .stage-name, .stage-2 .stage-note { animation-delay: 0.74s; }
.stage-3 .stage-code, .stage-3 .stage-name, .stage-3 .stage-note { animation-delay: 1.06s; }

@keyframes draw { to { stroke-dashoffset: 0; } }
@keyframes pop { to { transform: scale(1); opacity: 1; } }
@keyframes halo { to { transform: scale(1); opacity: 0.32; } }
@keyframes fade { to { opacity: 1; } }

@media (prefers-reduced-motion: reduce) {
  .spine { animation: none; stroke-dashoffset: 0; }
  .node { animation: none; transform: scale(1); opacity: 1; }
  .halo { animation: none; transform: scale(1); opacity: 0.32; }
  .stage-code, .stage-name, .stage-note, .measure path { animation: none; opacity: 1; }
}
</style>
