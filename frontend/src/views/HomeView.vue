<script setup>
import { computed, onMounted, ref } from 'vue'
import { ArrowRight, CalendarCheck2, Search, Sparkles, TicketCheck, UsersRound } from '@lucide/vue'
import EventCard from '../components/EventCard.vue'
import PageLoader from '../components/PageLoader.vue'
import { getErrorMessage, getEvents } from '../services/api'

const events = ref([])
const loading = ref(true)
const error = ref('')
const search = ref('')
const category = ref('All')
const categories = ['All', 'Technology', 'Education', 'Business', 'Community', 'Arts', 'Other']

function clearFilters() {
  search.value = ''
  category.value = 'All'
}

const upcomingEvents = computed(() =>
  events.value.filter((event) => new Date(event.date) >= new Date().setHours(0, 0, 0, 0)),
)
const totalRegistrations = computed(() =>
  events.value.reduce((total, event) => total + (event.registeredCount || 0), 0),
)
const filteredEvents = computed(() => {
  const term = search.value.toLowerCase().trim()
  return upcomingEvents.value.filter((event) => {
    const matchesCategory = category.value === 'All' || event.category === category.value
    const searchable =
      `${event.title} ${event.description} ${event.venue} ${event.organizer}`.toLowerCase()
    return matchesCategory && (!term || searchable.includes(term))
  })
})

onMounted(async () => {
  try {
    events.value = await getEvents()
  } catch (requestError) {
    error.value = getErrorMessage(requestError)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <section class="hero">
    <div class="hero-orb orb-one"></div>
    <div class="hero-orb orb-two"></div>
    <div class="container hero-grid">
      <div class="hero-copy">
        <span class="eyebrow"><Sparkles :size="16" /> Test Experiences worth showing up for</span>
        <h1>Find your next <span class="gradient-text">meaningful event V3.</span></h1>
        <p>
          Discover workshops, meetups, and community gatherings around you—then reserve your seat in
          just a few clicks.
        </p>
        <div class="hero-actions">
          <a class="button button-primary" href="#events"
            >Explore events <ArrowRight :size="19"
          /></a>
          <RouterLink class="button button-ghost" to="/admin">Host an event</RouterLink>
        </div>
        <div class="hero-trust">
          <span><CalendarCheck2 :size="18" /> {{ upcomingEvents.length }} upcoming events</span>
          <span><UsersRound :size="18" /> {{ totalRegistrations }} people registered</span>
        </div>
      </div>

      <div class="hero-visual" aria-hidden="true">
        <div class="visual-card card-main">
          <div class="mock-cover"><TicketCheck :size="44" /></div>
          <div class="mock-lines"><i></i><i></i><i></i></div>
          <span class="mock-button">Reserve a seat</span>
        </div>
        <div class="floating-pill pill-top"><CalendarCheck2 :size="19" /> Quick registration</div>
        <div class="floating-pill pill-bottom"><UsersRound :size="19" /> Meet your community</div>
      </div>
    </div>
  </section>

  <section id="events" class="events-section section">
    <div class="container">
      <div class="section-heading">
        <div>
          <span class="section-kicker">UPCOMING</span>
          <h2>Events made for curious people</h2>
        </div>
        <p>
          Search by topic or choose a category that matches what you want to learn and experience.
        </p>
      </div>

      <div class="filter-bar">
        <label class="search-field">
          <Search :size="20" />
          <input
            v-model="search"
            type="search"
            placeholder="Search events, venues, organizers..."
          />
        </label>
        <div class="category-filters">
          <button
            v-for="item in categories"
            :key="item"
            :class="{ active: category === item }"
            @click="category = item"
          >
            {{ item }}
          </button>
        </div>
      </div>

      <PageLoader v-if="loading" />
      <div v-else-if="error" class="state-card error-state">
        <h3>We could not load the events.</h3>
        <p>{{ error }}</p>
      </div>
      <div v-else-if="filteredEvents.length" class="event-grid">
        <EventCard v-for="event in filteredEvents" :key="event.id" :event="event" />
      </div>
      <div v-else class="state-card">
        <Search :size="30" />
        <h3>No matching events yet</h3>
        <p>Try a different search term or category.</p>
        <button class="text-link" @click="clearFilters">Clear filters</button>
      </div>
    </div>
  </section>

  <section class="cta-section section">
    <div class="container cta-card">
      <div>
        <span class="eyebrow light"><Sparkles :size="16" /> Create a moment people remember</span>
        <h2>Planning something special?</h2>
        <p>Publish your event and keep every registration organized in one place.</p>
      </div>
      <RouterLink class="button button-light" to="/admin"
        >Create an event <ArrowRight :size="19"
      /></RouterLink>
    </div>
  </section>
</template>
