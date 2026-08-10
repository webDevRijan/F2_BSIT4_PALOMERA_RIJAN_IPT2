<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import {
  CalendarDays,
  CheckCircle2,
  ImagePlus,
  ListFilter,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Upload,
  UserRoundCheck,
  UsersRound,
  X,
} from '@lucide/vue'
import PageLoader from '../components/PageLoader.vue'
import {
  createEvent,
  deleteEvent,
  getErrorMessage,
  getEvents,
  getRegistrations,
} from '../services/api'

const events = ref([])
const loading = ref(true)
const saving = ref(false)
const error = ref('')
const success = ref('')
const showForm = ref(false)
const selectedEvent = ref(null)
const registrations = ref([])
const loadingRegistrations = ref(false)
const coverInput = ref(null)
const coverPreview = ref('')
const search = ref('')
const categories = ['Technology', 'Education', 'Business', 'Community', 'Arts', 'Other']

const emptyForm = () => ({
  title: '',
  description: '',
  date: '',
  time: '',
  venue: '',
  category: 'Technology',
  organizer: '',
  capacity: 100,
  cover: null,
})
const form = reactive(emptyForm())

const totalRegistrations = computed(() =>
  events.value.reduce((sum, event) => sum + (event.registeredCount || 0), 0),
)
const totalCapacity = computed(() =>
  events.value.reduce((sum, event) => sum + Number(event.capacity || 0), 0),
)
const fillRate = computed(() =>
  totalCapacity.value ? Math.round((totalRegistrations.value / totalCapacity.value) * 100) : 0,
)
const filteredEvents = computed(() => {
  const term = search.value.toLowerCase().trim()
  return events.value.filter((event) =>
    `${event.title} ${event.venue} ${event.category}`.toLowerCase().includes(term),
  )
})

async function loadEvents() {
  loading.value = true
  error.value = ''
  try {
    events.value = await getEvents()
  } catch (requestError) {
    error.value = getErrorMessage(requestError)
  } finally {
    loading.value = false
  }
}

function chooseCover(event) {
  const file = event.target.files[0]
  if (!file) return
  form.cover = file
  coverPreview.value = URL.createObjectURL(file)
}

function resetForm() {
  Object.assign(form, emptyForm())
  coverPreview.value = ''
  if (coverInput.value) coverInput.value.value = ''
}

async function submitEvent() {
  saving.value = true
  error.value = ''
  success.value = ''
  const payload = new FormData()
  Object.entries(form).forEach(([key, value]) => {
    if (value !== null && value !== '') payload.append(key, value)
  })
  try {
    await createEvent(payload)
    success.value = 'Event published successfully.'
    showForm.value = false
    resetForm()
    await loadEvents()
  } catch (requestError) {
    error.value = getErrorMessage(requestError)
  } finally {
    saving.value = false
  }
}

async function removeEvent(event) {
  if (!window.confirm(`Delete “${event.title}” and all of its registrations?`)) return
  error.value = ''
  try {
    await deleteEvent(event.id)
    events.value = events.value.filter((item) => item.id !== event.id)
    if (selectedEvent.value?.id === event.id) selectedEvent.value = null
    success.value = 'Event deleted.'
  } catch (requestError) {
    error.value = getErrorMessage(requestError)
  }
}

async function viewRegistrations(event) {
  selectedEvent.value = event
  registrations.value = []
  loadingRegistrations.value = true
  try {
    registrations.value = await getRegistrations(event.id)
  } catch (requestError) {
    error.value = getErrorMessage(requestError)
  } finally {
    loadingRegistrations.value = false
  }
}

function formatDate(date) {
  return new Intl.DateTimeFormat('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date))
}

onMounted(loadEvents)
</script>

<template>
  <section class="admin-page section">
    <div class="container">
      <div class="admin-heading">
        <div>
          <span class="section-kicker">EVENT CONTROL CENTER</span>
          <h1>Manage your events</h1>
          <p>Create experiences, review attendance, and keep registration organized.</p>
        </div>
        <button class="button button-primary" @click="showForm = !showForm">
          <X v-if="showForm" :size="19" /><Plus v-else :size="19" />{{
            showForm ? 'Close form' : 'Create event'
          }}
        </button>
      </div>

      <div v-if="error" class="inline-error admin-alert">{{ error }}</div>
      <div v-if="success" class="inline-success admin-alert">
        <CheckCircle2 :size="19" />{{ success }}
      </div>

      <div v-if="showForm" class="create-panel">
        <div class="panel-heading">
          <div class="panel-icon"><CalendarDays :size="22" /></div>
          <div>
            <h2>Publish a new event</h2>
            <p>Complete the details people need before registering.</p>
          </div>
        </div>
        <form class="admin-form" @submit.prevent="submitEvent">
          <div class="form-grid">
            <div class="field-group span-two">
              <label for="eventTitle">Event title <span>*</span></label
              ><input
                id="eventTitle"
                v-model.trim="form.title"
                required
                placeholder="e.g. Mindoro Tech Connect 2026"
              />
            </div>
            <div class="field-group span-two">
              <label for="description">Description <span>*</span></label
              ><textarea
                id="description"
                v-model.trim="form.description"
                required
                rows="4"
                placeholder="What will guests learn or experience?"
              ></textarea>
            </div>
            <div class="field-group">
              <label for="date">Date <span>*</span></label
              ><input id="date" v-model="form.date" type="date" required />
            </div>
            <div class="field-group">
              <label for="time">Time <span>*</span></label
              ><input id="time" v-model.trim="form.time" required placeholder="1:00 PM - 5:00 PM" />
            </div>
            <div class="field-group">
              <label for="category">Category <span>*</span></label
              ><select id="category" v-model="form.category">
                <option v-for="item in categories" :key="item">{{ item }}</option>
              </select>
            </div>
            <div class="field-group">
              <label for="capacity">Capacity <span>*</span></label
              ><input
                id="capacity"
                v-model.number="form.capacity"
                type="number"
                min="1"
                max="100000"
                required
              />
            </div>
            <div class="field-group">
              <label for="venue">Venue <span>*</span></label
              ><input
                id="venue"
                v-model.trim="form.venue"
                required
                placeholder="Building or online location"
              />
            </div>
            <div class="field-group">
              <label for="organizer">Organizer <span>*</span></label
              ><input
                id="organizer"
                v-model.trim="form.organizer"
                required
                placeholder="Organization or host name"
              />
            </div>
            <div class="field-group span-two">
              <label>Cover image <small>(optional, maximum 5 MB)</small></label
              ><button
                type="button"
                class="upload-zone"
                :style="coverPreview ? { backgroundImage: `url(${coverPreview})` } : {}"
                @click="coverInput.click()"
              >
                <ImagePlus v-if="!coverPreview" :size="28" /><Upload v-else :size="26" /><span>{{
                  coverPreview ? 'Choose a different image' : 'Click to choose an event cover'
                }}</span></button
              ><input
                ref="coverInput"
                class="hidden-input"
                type="file"
                accept="image/*"
                @change="chooseCover"
              />
            </div>
          </div>
          <div class="form-actions">
            <button type="button" class="button button-ghost" @click="resetForm">Clear</button
            ><button class="button button-primary" :disabled="saving">
              {{ saving ? 'Publishing...' : 'Publish event' }}
            </button>
          </div>
        </form>
      </div>

      <div class="stats-grid">
        <article>
          <span class="stat-icon violet"><CalendarDays :size="23" /></span>
          <div>
            <small>Total events</small><strong>{{ events.length }}</strong>
          </div>
        </article>
        <article>
          <span class="stat-icon blue"><UsersRound :size="23" /></span>
          <div>
            <small>Registrations</small><strong>{{ totalRegistrations }}</strong>
          </div>
        </article>
        <article>
          <span class="stat-icon orange"><UserRoundCheck :size="23" /></span>
          <div>
            <small>Average fill rate</small><strong>{{ fillRate }}%</strong>
          </div>
        </article>
      </div>

      <div class="management-card">
        <div class="management-toolbar">
          <div>
            <h2>Your events</h2>
            <p>Click registrations to see the attendee list.</p>
          </div>
          <label class="mini-search"
            ><Search :size="18" /><input v-model="search" placeholder="Search events" /></label
          ><button class="icon-button" title="Refresh" @click="loadEvents">
            <RefreshCw :size="19" />
          </button>
        </div>
        <PageLoader v-if="loading" />
        <div v-else-if="!filteredEvents.length" class="state-card compact">
          <ListFilter :size="28" />
          <h3>No events found</h3>
          <p>Create an event or change your search.</p>
        </div>
        <div v-else class="event-table-wrap">
          <table class="event-table">
            <thead>
              <tr>
                <th>Event</th>
                <th>Date</th>
                <th>Registrations</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="event in filteredEvents" :key="event.id">
                <td>
                  <div class="table-event">
                    <span
                      :style="event.coverUrl ? { backgroundImage: `url(${event.coverUrl})` } : {}"
                      >{{ event.coverUrl ? '' : event.title.charAt(0) }}</span
                    >
                    <div>
                      <strong>{{ event.title }}</strong
                      ><small>{{ event.venue }}</small>
                    </div>
                  </div>
                </td>
                <td>{{ formatDate(event.date) }}</td>
                <td>
                  <button class="registration-count" @click="viewRegistrations(event)">
                    {{ event.registeredCount || 0 }} / {{ event.capacity }}
                  </button>
                </td>
                <td>
                  <span
                    class="status-badge"
                    :class="new Date(event.date) >= new Date() ? 'upcoming' : 'ended'"
                    >{{ new Date(event.date) >= new Date() ? 'Upcoming' : 'Ended' }}</span
                  >
                </td>
                <td>
                  <button
                    class="icon-button danger"
                    title="Delete event"
                    @click="removeEvent(event)"
                  >
                    <Trash2 :size="18" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div v-if="selectedEvent" class="drawer-overlay" @click.self="selectedEvent = null">
      <aside class="attendee-drawer">
        <div class="drawer-heading">
          <div>
            <span class="section-kicker">ATTENDEE LIST</span>
            <h2>{{ selectedEvent.title }}</h2>
            <p>
              {{ registrations.length }} registration{{ registrations.length === 1 ? '' : 's' }}
            </p>
          </div>
          <button class="icon-button" @click="selectedEvent = null"><X :size="21" /></button>
        </div>
        <PageLoader v-if="loadingRegistrations" />
        <div v-else-if="!registrations.length" class="state-card compact">
          <UsersRound :size="28" />
          <h3>No registrations yet</h3>
          <p>The attendee list will appear here.</p>
        </div>
        <div v-else class="attendee-list">
          <article v-for="registration in registrations" :key="registration.id">
            <span class="attendee-avatar">{{ registration.fullName.charAt(0) }}</span>
            <div>
              <strong>{{ registration.fullName }}</strong
              ><span>{{ registration.email }}</span
              ><small>{{ registration.ticketType }} · {{ registration.registrationCode }}</small>
            </div>
          </article>
        </div>
      </aside>
    </div>
  </section>
</template>
