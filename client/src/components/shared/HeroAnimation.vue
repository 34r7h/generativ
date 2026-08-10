<script setup>
/**
 * The hero graphic: promised versus measured.
 *
 * Left column — dashed, unlabelled bars: the claims made about this technology,
 * which have no units. Right column — solid cards carrying figures the site
 * cites elsewhere: what an engagement actually produces. Each row crosses once,
 * left to right, and stays put.
 *
 * The figures are the benchmarks published on the blog and the reports, not
 * promised gains, which is the whole distinction the graphic is drawing.
 *
 * Motion runs ONCE and rests on the finished state — `animation-iteration-count: 1`
 * with `fill-mode: both`. Nothing loops beside the copy while it is being read.
 * All of it is CSS on SVG nodes: no JavaScript, no rAF, nothing to unmount.
 */
</script>

<template>
  <svg
    class="hero-anim"
    viewBox="0 0 480 300"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-label="Unmeasured promises on the left, resolving into measured figures on the right"
  >
    <text class="col-label" x="16" y="26">PROMISED</text>
    <text class="col-label measured" x="268" y="26">MEASURED</text>

    <!-- Row 1 -->
    <g class="row row-1">
      <rect class="claim" x="16" y="56" width="176" height="46" rx="10" />
      <text class="claim-text" x="30" y="83">“10× productivity”</text>
      <g class="result">
        <rect x="268" y="56" width="196" height="46" rx="10" />
        <text class="figure" x="286" y="79">8–15 hrs<tspan class="unit" dx="9">per week</tspan></text>
      </g>
    </g>

    <!-- Row 2 -->
    <g class="row row-2">
      <rect class="claim" x="16" y="128" width="150" height="46" rx="10" />
      <text class="claim-text" x="30" y="155">“AI-powered”</text>
      <g class="result">
        <rect x="268" y="128" width="196" height="46" rx="10" />
        <text class="figure" x="286" y="151">$12–20<tspan class="unit" dx="9">per form</tspan></text>
      </g>
    </g>

    <!-- Row 3 -->
    <g class="row row-3">
      <rect class="claim" x="16" y="200" width="192" height="46" rx="10" />
      <text class="claim-text" x="30" y="227">“transformational”</text>
      <g class="result">
        <rect x="268" y="200" width="196" height="46" rx="10" />
        <text class="figure" x="286" y="223">12 min<tspan class="unit" dx="9">to first reply</tspan></text>
      </g>
    </g>

    <!-- The crossing -->
    <g class="cross">
      <path d="M204 79 H 260" />
      <path d="M178 151 H 260" />
      <path d="M220 223 H 260" />
    </g>
    <g class="head">
      <path d="M250 73 l7 6 -7 6" />
      <path d="M250 145 l7 6 -7 6" />
      <path d="M250 217 l7 6 -7 6" />
    </g>
  </svg>
</template>

<style scoped>
.hero-anim {
  display: block;
  width: 100%;
  height: auto;
  max-width: 520px;
  font-family: var(--font-sans, 'Inter', system-ui, sans-serif);
}

.col-label {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.14em;
  fill: var(--light-text, #718096);
}

.col-label.measured {
  fill: var(--primary-color, #4c6fff);
}

/* A claim with no units: dashed, hollow, and it does not stay. */
.claim {
  fill: none;
  stroke: var(--light-text, #718096);
  stroke-width: 2;
  stroke-dasharray: 7 6;
  opacity: 0;
  animation: claim-in 0.5s ease-out both, claim-out 0.55s ease-in both;
}

.claim-text {
  font-size: 14px;
  font-weight: 500;
  fill: var(--light-text, #718096);
  opacity: 0;
  animation: claim-in 0.5s ease-out both, claim-out 0.55s ease-in both;
}

.result rect {
  fill: var(--primary-color, #4c6fff);
  transform-box: fill-box;
  transform-origin: left center;
  transform: scaleX(0.24);
  opacity: 0;
  animation: land 0.62s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.figure {
  font-size: 21px;
  font-weight: 700;
  fill: #ffffff;
  opacity: 0;
  animation: text-in 0.4s ease-out both;
}

.unit {
  font-size: 12.5px;
  font-weight: 500;
  fill: rgba(255, 255, 255, 0.82);
  opacity: 0;
  animation: text-in 0.4s ease-out both;
}

.cross path,
.head path {
  fill: none;
  stroke: var(--primary-color, #4c6fff);
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
  opacity: 0.55;
}

.cross path {
  stroke-dasharray: 90;
  stroke-dashoffset: 90;
  animation: draw 0.5s ease-out both;
}

.head path {
  opacity: 0;
  animation: text-in 0.3s ease-out both;
}

/* Each row runs a beat after the one above it. */
.row-1 .claim, .row-1 .claim-text { animation-delay: 0.25s, 0.95s; }
.row-2 .claim, .row-2 .claim-text { animation-delay: 0.55s, 1.25s; }
.row-3 .claim, .row-3 .claim-text { animation-delay: 0.85s, 1.55s; }

.cross path:nth-child(1) { animation-delay: 0.95s; }
.cross path:nth-child(2) { animation-delay: 1.25s; }
.cross path:nth-child(3) { animation-delay: 1.55s; }

.head path:nth-child(1) { animation-delay: 1.35s; }
.head path:nth-child(2) { animation-delay: 1.65s; }
.head path:nth-child(3) { animation-delay: 1.95s; }

.row-1 .claim-text {
  font-size: 14px;
  font-weight: 500;
  fill: var(--light-text, #718096);
  opacity: 0;
  animation: claim-in 0.5s ease-out both, claim-out 0.55s ease-in both;
}

.result rect { animation-delay: 1.3s; }
.row-2 .claim-text {
  font-size: 14px;
  font-weight: 500;
  fill: var(--light-text, #718096);
  opacity: 0;
  animation: claim-in 0.5s ease-out both, claim-out 0.55s ease-in both;
}

.result rect { animation-delay: 1.6s; }
.row-3 .claim-text {
  font-size: 14px;
  font-weight: 500;
  fill: var(--light-text, #718096);
  opacity: 0;
  animation: claim-in 0.5s ease-out both, claim-out 0.55s ease-in both;
}

.result rect { animation-delay: 1.9s; }

.row-1 .figure, .row-1 .unit { animation-delay: 1.62s; }
.row-2 .figure, .row-2 .unit { animation-delay: 1.92s; }
.row-3 .figure, .row-3 .unit { animation-delay: 2.22s; }

@keyframes claim-in {
  from { opacity: 0; transform: translateX(-10px); }
  to   { opacity: 0.85; transform: translateX(0); }
}

@keyframes claim-out {
  from { opacity: 0.85; transform: translateX(0); }
  to   { opacity: 0.3; transform: translateX(12px); }
}

@keyframes draw {
  to { stroke-dashoffset: 0; }
}

@keyframes land {
  from { transform: scaleX(0.24); opacity: 0; }
  to   { transform: scaleX(1); opacity: 1; }
}

@keyframes text-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}

/* No motion: land on the finished state immediately. */
@media (prefers-reduced-motion: reduce) {
  .claim, .claim-text { animation: none; opacity: 0.3; }
  .claim-text {
  font-size: 14px;
  font-weight: 500;
  fill: var(--light-text, #718096);
  opacity: 0;
  animation: claim-in 0.5s ease-out both, claim-out 0.55s ease-in both;
}

.result rect { animation: none; opacity: 1; transform: scaleX(1); }
  .figure, .unit, .head path { animation: none; opacity: 1; }
  .cross path { animation: none; stroke-dashoffset: 0; }
}
</style>
