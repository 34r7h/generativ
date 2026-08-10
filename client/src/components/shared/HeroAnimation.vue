<script setup>
/**
 * The hero graphic: the gap between promise and productivity, animated.
 *
 * Left: scattered, faint marks drifting — capability that has not been aimed
 * at anything. Middle: three channels carrying it across. Right: solid, evenly
 * stacked bars — work that actually comes out.
 *
 * All motion is CSS on SVG nodes: no JavaScript, no rAF loop, nothing to clean
 * up on unmount. The moving parts are dash offsets and opacity, both of which
 * the compositor handles cheaply, and everything stops under
 * prefers-reduced-motion, which leaves a composition that still reads.
 */
</script>

<template>
  <svg
    class="hero-anim"
    viewBox="0 0 460 320"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-label="Scattered signals resolving into steady output"
  >
    <!-- Promise: unaimed capability -->
    <g class="scatter">
      <circle cx="34" cy="58" r="4" />
      <circle cx="74" cy="36" r="3" />
      <circle cx="26" cy="122" r="3" />
      <circle cx="68" cy="104" r="5" />
      <circle cx="38" cy="186" r="3" />
      <circle cx="80" cy="168" r="4" />
      <circle cx="30" cy="248" r="4" />
      <circle cx="76" cy="238" r="3" />
      <circle cx="52" cy="292" r="3" />
      <circle cx="92" cy="272" r="4" />
    </g>

    <!-- The channels across -->
    <g class="channels">
      <path d="M104 70 C 180 70, 190 108, 268 108" />
      <path d="M104 160 C 180 160, 190 160, 268 160" />
      <path d="M104 254 C 180 254, 190 212, 268 212" />
    </g>

    <!-- What is carried, moving left to right -->
    <g class="flow">
      <path d="M104 70 C 180 70, 190 108, 268 108" />
      <path d="M104 160 C 180 160, 190 160, 268 160" />
      <path d="M104 254 C 180 254, 190 212, 268 212" />
    </g>

    <!-- Productivity: steady, aligned output -->
    <g class="output">
      <rect x="286" y="88" width="132" height="34" rx="8" />
      <rect x="286" y="136" width="132" height="34" rx="8" />
      <rect x="286" y="184" width="132" height="34" rx="8" />
    </g>

    <!-- A measured result, the last thing to arrive -->
    <g class="ticks">
      <path d="M302 105 l7 7 14 -14" />
      <path d="M302 153 l7 7 14 -14" />
      <path d="M302 201 l7 7 14 -14" />
    </g>
  </svg>
</template>

<style scoped>
.hero-anim {
  display: block;
  width: 100%;
  height: auto;
  max-width: 520px;
  overflow: visible;
}

/* Left-hand marks: present, quiet, breathing slightly out of step. */
.scatter circle {
  fill: var(--primary-color, #4c6fff);
  opacity: 0.22;
  animation: drift 7s ease-in-out infinite;
}

.scatter circle:nth-child(2n) { animation-duration: 9s; animation-delay: -1.4s; }
.scatter circle:nth-child(3n) { animation-duration: 11s; animation-delay: -3.1s; }
.scatter circle:nth-child(5n) { animation-duration: 8s; animation-delay: -2.2s; }

@keyframes drift {
  0%, 100% { transform: translate(0, 0); opacity: 0.18; }
  50%      { transform: translate(3px, -6px); opacity: 0.42; }
}

/* The channels themselves stay still and faint — they are the structure. */
.channels path {
  fill: none;
  stroke: var(--primary-color, #4c6fff);
  stroke-width: 2;
  opacity: 0.16;
}

/* A short dash travelling each channel: the work moving across. */
.flow path {
  fill: none;
  stroke: var(--primary-color, #4c6fff);
  stroke-width: 3;
  stroke-linecap: round;
  stroke-dasharray: 26 340;
  animation: carry 4.6s cubic-bezier(0.45, 0, 0.35, 1) infinite;
}

.flow path:nth-child(2) { animation-delay: -1.5s; }
.flow path:nth-child(3) { animation-delay: -3s; }

@keyframes carry {
  0%   { stroke-dashoffset: 366; opacity: 0; }
  12%  { opacity: 0.85; }
  78%  { opacity: 0.85; }
  100% { stroke-dashoffset: 0; opacity: 0; }
}

/* Output bars settle in sequence, then hold. */
.output rect {
  fill: var(--primary-color, #4c6fff);
  opacity: 0.9;
  transform-box: fill-box;
  transform-origin: left center;
  animation: settle 4.6s cubic-bezier(0.22, 1, 0.36, 1) infinite;
}

.output rect:nth-child(2) { animation-delay: -1.5s; }
.output rect:nth-child(3) { animation-delay: -3s; }

@keyframes settle {
  0%, 30%   { transform: scaleX(0.82); opacity: 0.5; }
  46%, 100% { transform: scaleX(1); opacity: 0.9; }
}

.ticks path {
  fill: none;
  stroke: #ffffff;
  stroke-width: 3;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 30;
  animation: mark 4.6s ease-out infinite;
}

.ticks path:nth-child(2) { animation-delay: -1.5s; }
.ticks path:nth-child(3) { animation-delay: -3s; }

@keyframes mark {
  0%, 34%  { stroke-dashoffset: 30; }
  52%, 100% { stroke-dashoffset: 0; }
}

/* Motion is decoration here; the still composition carries the same meaning. */
@media (prefers-reduced-motion: reduce) {
  .scatter circle,
  .flow path,
  .output rect,
  .ticks path {
    animation: none;
  }

  .scatter circle { opacity: 0.3; }
  .flow path { stroke-dashoffset: 0; stroke-dasharray: none; opacity: 0.5; }
  .ticks path { stroke-dashoffset: 0; }
}
</style>
