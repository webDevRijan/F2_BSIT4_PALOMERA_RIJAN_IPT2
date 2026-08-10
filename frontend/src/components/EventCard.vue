<script setup>
import { computed } from 'vue'
import { ArrowUpRight, CalendarDays, MapPin, Users } from '@lucide/vue'

const props = defineProps({ event: { type: Object, required: true } })

const formattedDate = computed(() =>
  new Intl.DateTimeFormat('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(props.event.date)),
)

const seatsLeft = computed(() =>
  Math.max(0, props.event.capacity - (props.event.registeredCount || 0)),
)
const theme = computed(
  () => props.event.theme || ['violet', 'blue', 'orange'][props.event.title.length % 3],
)
</script>

<template>
  <article class="event-card">
    <div
      class="event-cover"
      :class="`theme-${theme}`"
      :style="event.coverUrl ? { backgroundImage: `url(${event.coverUrl})` } : {}"
    >
      <span class="category-badge">{{ event.category }}</span>
      <span v-if="!event.coverUrl" class="cover-letter">{{ event.title.charAt(0) }}</span>
    </div>
    <div class="event-card-body">
      <div class="event-meta primary-meta">
        <CalendarDays :size="17" />
        <span>{{ formattedDate }} · {{ event.time }}</span>
      </div>
      <h3>{{ event.title }}</h3>
      <p class="event-description">{{ event.description }}</p>
      <div class="event-meta">
        <MapPin :size="17" /><span>{{ event.venue }}</span>
      </div>
      <div class="card-footer">
        <span class="seats"><Users :size="17" /> {{ seatsLeft }} seats left</span>
        <RouterLink class="text-link" :to="`/events/${event.id}`">
          View event <ArrowUpRight :size="17" />
        </RouterLink>
      </div>
    </div>
  </article>
</template>
