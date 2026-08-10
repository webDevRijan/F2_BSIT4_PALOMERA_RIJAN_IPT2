<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, CalendarDays, Check, Clock3, MapPin, ShieldCheck, UserRound } from '@lucide/vue'
import PageLoader from '../components/PageLoader.vue'
import { getErrorMessage, getEvent, registerForEvent } from '../services/api'

const route = useRoute()
const router = useRouter()
const event = ref(null)
const loading = ref(true)
const submitting = ref(false)
const error = ref('')
const agreed = ref(false)
const form = reactive({
  fullName: '',
  email: '',
  phone: '',
  organization: '',
  ticketType: 'General',
})
const formattedDate = computed(
  () =>
    event.value &&
    new Intl.DateTimeFormat('en-PH', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(event.value.date)),
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

async function submitRegistration() {
  error.value = ''
  if (!agreed.value) {
    error.value = 'Please confirm that your information is correct.'
    return
  }
  submitting.value = true
  try {
    const result = await registerForEvent(route.params.id, form)
    router.push({
      name: 'registration-success',
      query: { code: result.registrationCode, event: event.value.title, name: form.fullName },
    })
  } catch (requestError) {
    error.value = getErrorMessage(requestError)
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <section class="inner-page section">
    <div class="container narrow-container">
      <RouterLink class="back-link" :to="`/events/${route.params.id}`"
        ><ArrowLeft :size="18" /> Back to event</RouterLink
      >
      <PageLoader v-if="loading" />
      <div v-else-if="!event" class="state-card error-state">
        <h2>Registration unavailable</h2>
        <p>{{ error }}</p>
      </div>
      <div v-else class="registration-layout">
        <div class="form-card">
          <span class="section-kicker">SAVE YOUR SPOT</span>
          <h1>Complete your registration</h1>
          <p class="form-intro">
            Tell us a little about yourself. We will use these details to confirm your attendance.
          </p>
          <form @submit.prevent="submitRegistration">
            <div class="field-group">
              <label for="fullName">Full name <span>*</span></label>
              <div class="input-wrap">
                <UserRound :size="19" /><input
                  id="fullName"
                  v-model.trim="form.fullName"
                  required
                  autocomplete="name"
                  placeholder="Juan Dela Cruz"
                />
              </div>
            </div>
            <div class="form-grid">
              <div class="field-group">
                <label for="email">Email address <span>*</span></label
                ><input
                  id="email"
                  v-model.trim="form.email"
                  type="email"
                  required
                  autocomplete="email"
                  placeholder="juan@email.com"
                />
              </div>
              <div class="field-group">
                <label for="phone">Mobile number <span>*</span></label
                ><input
                  id="phone"
                  v-model.trim="form.phone"
                  required
                  autocomplete="tel"
                  placeholder="09XX XXX XXXX"
                />
              </div>
            </div>
            <div class="form-grid">
              <div class="field-group">
                <label for="organization">School / organization</label
                ><input id="organization" v-model.trim="form.organization" placeholder="Optional" />
              </div>
              <div class="field-group">
                <label for="ticketType">Registration type</label
                ><select id="ticketType" v-model="form.ticketType">
                  <option>General</option>
                  <option>Student</option>
                  <option>VIP</option>
                </select>
              </div>
            </div>
            <label class="check-row"
              ><input v-model="agreed" type="checkbox" /><span class="custom-check"
                ><Check :size="14" /></span
              ><span>I confirm that the information I entered is correct.</span></label
            >
            <div v-if="error" class="inline-error">{{ error }}</div>
            <button class="button button-primary button-full" :disabled="submitting">
              {{ submitting ? 'Reserving your seat...' : 'Complete registration' }}
            </button>
            <p class="privacy-line">
              <ShieldCheck :size="16" /> Your information is kept private and secure.
            </p>
          </form>
        </div>

        <aside class="registration-summary">
          <span class="summary-label">YOU'RE REGISTERING FOR</span>
          <h2>{{ event.title }}</h2>
          <div>
            <CalendarDays :size="19" /><span>{{ formattedDate }}</span>
          </div>
          <div>
            <Clock3 :size="19" /><span>{{ event.time }}</span>
          </div>
          <div>
            <MapPin :size="19" /><span>{{ event.venue }}</span>
          </div>
          <hr />
          <p>
            Hosted by <strong>{{ event.organizer }}</strong>
          </p>
        </aside>
      </div>
    </div>
  </section>
</template>
