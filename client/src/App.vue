<script setup>
import { onMounted, onBeforeUnmount, computed, watch, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import AppHeader from './components/shared/AppHeader.vue';
import AppFooter from './components/shared/AppFooter.vue';

// Base system first, public theme last: theme.css redefines the legacy tokens
// both of the older sheets declare, and it has to win.
import './assets/design-system.css';
import './assets/theme.css';

const route = useRoute();

const isAdminPage = computed(() => route.path.startsWith('/admin'));

/*
 * Scroll reveal.
 *
 * One observer for the whole app rather than one per component. Elements are
 * revealed once and then unobserved — nothing re-animates on the way back up,
 * and nothing keeps running beside the copy.
 */
let observer = null;
let mutations = null;
let scanQueued = false;

function scanForReveals() {
  if (!observer) return;
  document.querySelectorAll('.g-reveal:not(.is-in)').forEach((el) => observer.observe(el));
}

// Page content arrives from the CMS well after mount, so a one-off scan on
// mount reveals nothing — the elements do not exist yet. Watching the DOM is
// what makes this work for every view without each one having to remember to
// call back in after its fetch resolves.
function queueScan() {
  if (scanQueued) return;
  scanQueued = true;
  requestAnimationFrame(() => {
    scanQueued = false;
    scanForReveals();
  });
}

onMounted(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Arms the hidden state. Until this class is on, `.g-reveal` renders as
  // ordinary visible content.
  document.getElementById('app-container')?.classList.add('reveal-ready');

  if (reduced || !('IntersectionObserver' in window)) {
    // Reveal everything that exists now, and everything added later.
    const showAll = () =>
      document.querySelectorAll('.g-reveal:not(.is-in)').forEach((el) => el.classList.add('is-in'));
    showAll();
    mutations = new MutationObserver(showAll);
    mutations.observe(document.body, { childList: true, subtree: true });
    return;
  }

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.06 }
  );

  scanForReveals();

  mutations = new MutationObserver(queueScan);
  mutations.observe(document.body, { childList: true, subtree: true });
});

onBeforeUnmount(() => {
  observer?.disconnect();
  mutations?.disconnect();
});

// Route changes swap the whole tree; the scan has to run again once the new
// nodes exist. The MutationObserver covers this too, but the explicit pass
// keeps the first paint of a new route from waiting on a batched callback.
watch(
  () => route.fullPath,
  () => {
    nextTick(() => setTimeout(scanForReveals, 60));
  }
);
</script>

<template>
  <div id="app-container" :class="isAdminPage ? 'admin-mode' : 'public-shell'">
    <!-- Public layout -->
    <template v-if="!isAdminPage">
      <AppHeader />
      <main>
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in" @after-enter="scanForReveals">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
      <AppFooter />
    </template>

    <!-- Admin layout -->
    <template v-else>
      <!-- No wrapper here. Every admin page is its own layout root and carries
           the class itself; wrapping them in a second .admin-layout put each
           page inside the 280px sidebar column of an outer grid, collapsing the
           content column to 48px. -->
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </template>
  </div>
</template>

<style>
/* Import fonts */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@200..900&display=swap');
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap');

html, body {
  margin: 0;
  padding: 0;
  height: 100%;
}

#app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

main {
  flex: 1;
  margin-top: 72px; /* fixed header */
}

/* Page Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Admin mode specific styles */
.admin-mode {
  background-color: var(--gray-100);
}

.admin-mode main {
  margin-top: 0;
}
</style>
