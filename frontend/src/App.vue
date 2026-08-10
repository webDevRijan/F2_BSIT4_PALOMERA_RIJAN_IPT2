<script setup>
import { ref } from 'vue'
import { CalendarDays, Menu, X } from '@lucide/vue'
import ThemeToggle from './components/ThemeToggle.vue'

const menuOpen = ref(false)
const closeMenu = () => {
  menuOpen.value = false
}
</script>

<template>
  <div class="site-shell">
    <header class="site-header">
      <div class="container nav-wrap">
        <RouterLink class="brand" to="/" @click="closeMenu">
          <span class="brand-icon"><CalendarDays :size="22" /></span>
          <span>evently</span>
        </RouterLink>

        <button
          class="icon-button mobile-menu"
          aria-label="Toggle navigation"
          @click="menuOpen = !menuOpen"
        >
          <X v-if="menuOpen" :size="22" />
          <Menu v-else :size="22" />
        </button>

        <nav class="main-nav" :class="{ open: menuOpen }">
          <RouterLink to="/" @click="closeMenu">Discover</RouterLink>
          <RouterLink to="/admin" @click="closeMenu">Manage Events</RouterLink>
          <RouterLink class="button button-small button-primary" to="/#events" @click="closeMenu">
            Browse Events
          </RouterLink>
          <ThemeToggle />
        </nav>
      </div>
    </header>

    <main>
      <RouterView />
    </main>

    <footer class="site-footer">
      <div class="container footer-row">
        <div>
          <div class="brand footer-brand">
            <span class="brand-icon"><CalendarDays :size="20" /></span>
            <span>evently</span>
          </div>
          <p>Making meaningful events easier to discover and join.</p>
        </div>
        <p>Rijan's Project · Para makaalis na sa College</p>
      </div>
    </footer>
  </div>
</template>
