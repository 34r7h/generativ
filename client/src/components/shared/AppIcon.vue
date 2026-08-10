<script setup>
/**
 * Single-source icon set. Every icon is drawn on a 24x24 grid with a 1.75
 * stroke in `currentColor`, so an icon inherits the colour of the text it sits
 * with and never needs a colour of its own. No emoji anywhere in the app.
 */
import { computed } from 'vue';

const props = defineProps({
  name: { type: String, required: true },
  size: { type: [Number, String], default: 24 },
  label: { type: String, default: '' }
});

// Path data only — every icon shares the same stroke/linecap treatment below.
const PATHS = {
  // Practice / service marks
  shield: ['M12 3 4.5 6v5.5c0 4.4 3.1 8.2 7.5 9.5 4.4-1.3 7.5-5.1 7.5-9.5V6L12 3Z', 'M9 12.2l2.1 2.1L15.4 10'],
  bolt: ['M13.2 2.5 4.8 13.4h6.1l-.9 8.1 8.4-10.9h-6.1l.9-8.1Z'],
  brain: ['M9.5 4.2A2.7 2.7 0 0 0 6.8 7a2.6 2.6 0 0 0-1.6 4.6A2.7 2.7 0 0 0 6.4 16a2.6 2.6 0 0 0 3.1 3.4V4.2Z', 'M14.5 4.2A2.7 2.7 0 0 1 17.2 7a2.6 2.6 0 0 1 1.6 4.6A2.7 2.7 0 0 1 17.6 16a2.6 2.6 0 0 1-3.1 3.4V4.2Z', 'M12 4v16'],
  compass: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z', 'm15.2 8.8-2 4.4-4.4 2 2-4.4 4.4-2Z'],
  handshake: ['m3.5 12.5 3-3 3.5 3.5 2-2 2 2 3.5-3.5 3 3', 'M3.5 12.5V16l4.5 4 2-2 2 2 2-2 2 2 4.5-4v-3.5'],
  chart: ['M4 20h16', 'M7 20v-6', 'M12 20V7', 'M17 20v-9'],
  target: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z', 'M12 16.5a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Z', 'M12 13.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z'],
  workflow: ['M4 5.5h6v5H4z', 'M14 13.5h6v5h-6z', 'M7 10.5V16h7'],
  database: ['M12 7.5c3.9 0 7-1.1 7-2.5S15.9 2.5 12 2.5 5 3.6 5 5s3.1 2.5 7 2.5Z', 'M19 5v6.5c0 1.4-3.1 2.5-7 2.5s-7-1.1-7-2.5V5', 'M19 11.5V18c0 1.4-3.1 2.5-7 2.5s-7-1.1-7-2.5v-6.5'],
  cpu: ['M8 8h8v8H8z', 'M6 6h12v12H6z', 'M10 3v3M14 3v3M10 18v3M14 18v3M3 10h3M3 14h3M18 10h3M18 14h3'],
  layers: ['m12 3 8 4.5-8 4.5-8-4.5L12 3Z', 'm4 12 8 4.5 8-4.5', 'm4 16.5 8 4.5 8-4.5'],
  book: ['M5 4.5h9.5a2.5 2.5 0 0 1 2.5 2.5v13a2 2 0 0 0-2-2H5v-13Z', 'M19 4.5v13'],
  users: ['M9.5 11.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z', 'M3 20v-1a5 5 0 0 1 5-5h3a5 5 0 0 1 5 5v1', 'M16.5 5.2a3.5 3.5 0 0 1 0 6.6', 'M18 14.2a5 5 0 0 1 3 4.6V20'],
  user: ['M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z', 'M4.5 20.5v-1a5.5 5.5 0 0 1 5.5-5.5h4a5.5 5.5 0 0 1 5.5 5.5v1'],
  search: ['M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14Z', 'm16 16 4.5 4.5'],

  // Interface
  check: ['m5 12.5 4.5 4.5L19 7.5'],
  arrowRight: ['M4.5 12h15', 'm13.5 6 6 6-6 6'],
  arrowLeft: ['M19.5 12h-15', 'm10.5 6-6 6 6 6'],
  download: ['M12 4v11', 'm7.5 10.5 4.5 4.5 4.5-4.5', 'M4.5 19.5h15'],
  external: ['M14 4.5h5.5V10', 'M19.5 4.5 11 13', 'M17 14v4.5a1.5 1.5 0 0 1-1.5 1.5h-10A1.5 1.5 0 0 1 4 18.5v-10A1.5 1.5 0 0 1 5.5 7H10'],
  document: ['M6 3.5h7l5 5v12H6z', 'M13 3.5v5h5', 'M9 13h6M9 16.5h6'],
  folder: ['M3.5 6.5h5l2 2.5h10v9.5a1.5 1.5 0 0 1-1.5 1.5h-14A1.5 1.5 0 0 1 3.5 18.5v-12Z'],
  mail: ['M4 5.5h16v13H4z', 'm4 7 8 6 8-6'],
  phone: ['M7.5 3.5h-2A2.5 2.5 0 0 0 3 6.2C3 13.8 9.2 20 16.8 20a2.5 2.5 0 0 0 2.7-2.5v-2l-4-1.5-2 2.5a13.6 13.6 0 0 1-5-5L11 9.5 9.5 5.5l-2-2Z'],
  pin: ['M12 21s6.5-6 6.5-10.5a6.5 6.5 0 1 0-13 0C5.5 15 12 21 12 21Z', 'M12 13a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z'],
  calendar: ['M4.5 6.5h15v13h-15z', 'M4.5 10.5h15', 'M9 3.5v4M15 3.5v4'],
  clock: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z', 'M12 7.5V12l3 2'],
  linkedin: ['M5 9.5h3v10H5z', 'M6.5 6.6a1.6 1.6 0 1 0 0-3.2 1.6 1.6 0 0 0 0 3.2Z', 'M11 19.5v-10h3v1.5a3.5 3.5 0 0 1 6 2.4v6.1h-3v-5.4a1.9 1.9 0 0 0-3.8 0v5.4H11Z'],
  twitter: ['M4 4.5 20 20', 'M20 4.5 4 20'],
  plus: ['M12 5v14M5 12h14'],
  wrench: ['M15.5 3.5a5 5 0 0 0-4.7 6.7L3.5 17.5 6 20l7.3-7.3a5 5 0 0 0 6.4-6.4l-3 3-2.6-2.6 3-3a5 5 0 0 0-1.6-.2Z'],
  image: ['M4 5.5h16v13H4z', 'M8.5 11a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z', 'm4 16 4.5-4 4 3.5L16 12l4 4'],

  // Admin chrome
  home: ['m3.5 10.5 8.5-7 8.5 7', 'M6 9.5V20h12V9.5', 'M10 20v-5.5h4V20'],
  menu: ['M4 7h16M4 12h16M4 17h16'],
  close: ['M6 6l12 12M18 6 6 18'],
  gear: ['M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z', 'M12 2.5l1.6 2.6 3-.4.6 3 2.7 1.4-1.3 2.9 1.3 2.9-2.7 1.4-.6 3-3-.4L12 21.5l-1.6-2.6-3 .4-.6-3-2.7-1.4 1.3-2.9-1.3-2.9L6.8 7.7l.6-3 3 .4L12 2.5Z'],
  pencil: ['M4 20h4l10-10-4-4L4 16v4Z', 'm14.5 5.5 4 4'],
  trash: ['M4.5 6.5h15', 'M9 6.5V4h6v2.5', 'M6.5 6.5 7.5 20h9l1-13.5', 'M10 10v6M14 10v6'],
  alert: ['M12 3 2.5 20h19L12 3Z', 'M12 9.5v4.5', 'M12 17.2v.1'],
  logout: ['M9.5 4.5H6A1.5 1.5 0 0 0 4.5 6v12A1.5 1.5 0 0 0 6 19.5h3.5', 'M14 8l4 4-4 4', 'M18 12H9']
};

const paths = computed(() => PATHS[props.name] || []);
</script>

<template>
  <svg
    class="app-icon"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.75"
    stroke-linecap="round"
    stroke-linejoin="round"
    :aria-hidden="label ? undefined : 'true'"
    :role="label ? 'img' : undefined"
    :aria-label="label || undefined"
  >
    <title v-if="label">{{ label }}</title>
    <path v-for="(d, i) in paths" :key="i" :d="d" />
  </svg>
</template>

<style scoped>
.app-icon {
  display: inline-block;
  flex-shrink: 0;
  vertical-align: middle;
}
</style>
