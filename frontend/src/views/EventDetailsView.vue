<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  MapPin,
  ShieldCheck,
  TicketCheck,
  UserRound,
  Users,
} from '@lucide/vue'
import PageLoader from '../components/PageLoader.vue'
import { getErrorMessage, getEvent } from '../services/api'

const route = useRoute()
const event = ref(null)
const loading = ref(true)
const error = ref('')
const formattedDate = computed(
  () =>
    event.value &&
    new Intl.DateTimeFormat('en-PH', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(event.value.date)),
)
const seatsLeft = computed(() =>
  event.value ? Math.max(0, event.value.capacity - (event.value.registeredCount || 0)) : 0,
)
const progress = computed(() =>
  event.value
    ? Math.min(100, ((event.value.registeredCount || 0) / event.value.capacity) * 100)
    : 0,
)

onMounted(async () => {
  try {
    event.value = await getEvent(route.params.id)
  } catch (requestError) {
    error.value = getErrorMessage(requestError)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <section class="inner-page section">
    <div class="container">
      <RouterLink class="back-link" to="/"><ArrowLeft :size="18" /> Back to events</RouterLink>
      <PageLoader v-if="loading" />
      <div v-else-if="error" class="state-card error-state">
        <h2>Event unavailable</h2>
        <p>{{ error }}</p>
      </div>
      <div v-else class="details-layout">
        <div>
          <div
            class="details-cover"
            :style="event.coverUrl ? { backgroundImage: `url(${event.coverUrl})` } : {}"
          >
            <span class="category-badge">{{ event.category }}</span>
            <TicketCheck v-if="!event.coverUrl" :size="80" />
          </div>
          <div class="details-content">
            <span class="section-kicker">{{ event.category }}</span>
            <h1>{{ event.title }}</h1>
            <p class="lead">{{ event.description }}</p>
            <div class="host-line">
              <span class="host-avatar"><UserRound :size="20" /></span
              ><span
                >Organized by <strong>{{ event.organizer }}</strong></span
              >
            </div>
            <hr />
            <h2>About this event</h2>
            <p>
              This event is open to people who want to learn, connect, and take part in a welcoming
              community experience. Complete the short registration form to reserve your place.
            </p>
            <div class="info-note">
              <ShieldCheck :size="22" /><span
                >Your information is used only to manage this event registration.</span
              >
            </div>
          </div>
        </div>

        <aside class="booking-card">
          <h3>Event details</h3>
          <div class="booking-row">
            <span class="detail-icon"><CalendarDays :size="20" /></span>
            <div>
              <small>Date</small><strong>{{ formattedDate }}</strong>
            </div>
          </div>
          <div class="booking-row">
            <span class="detail-icon"><Clock3 :size="20" /></span>
            <div>
              <small>Time</small><strong>{{ event.time }}</strong>
            </div>
          </div>
          <div class="booking-row">
            <span class="detail-icon"><MapPin :size="20" /></span>
            <div>
              <small>Venue</small><strong>{{ event.venue }}</strong>
            </div>
          </div>
          <div class="capacity-block">
            <div>
              <span><Users :size="18" /> Availability</span
              ><strong>{{ seatsLeft }} seats left</strong>
            </div>
            <div class="progress-track"><span :style="{ width: `${progress}%` }"></span></div>
            <small>{{ event.registeredCount || 0 }} of {{ event.capacity }} spots reserved</small>
          </div>
          <RouterLink
            v-if="seatsLeft > 0"
            class="button button-primary button-full"
            :to="`/events/${event.id}/register`"
            >Register now</RouterLink
          >
          <button v-else class="button button-disabled button-full" disabled>Event is full</button>
          <p class="booking-help">Registration takes less than two minutes.</p>
        </aside>
      </div>
    </div>
  </section>
</template>
