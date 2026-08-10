<script setup>
import { useRoute } from 'vue-router'
import { ArrowRight, CalendarCheck2, Check, Copy } from '@lucide/vue'

const route = useRoute()
const code = route.query.code || 'Unavailable'
const copyCode = async () => {
  await navigator.clipboard?.writeText(code)
}
</script>

<template>
  <section class="success-page section">
    <div class="container">
      <div class="success-card">
        <div class="success-icon"><Check :size="38" /></div>
        <span class="section-kicker">REGISTRATION CONFIRMED</span>
        <h1>You're on the list, {{ route.query.name || 'guest' }}!</h1>
        <p>
          Your seat for <strong>{{ route.query.event || 'the event' }}</strong> has been reserved.
          Save the reference code below.
        </p>
        <div class="reference-box">
          <span
            ><small>REGISTRATION CODE</small><strong>{{ code }}</strong></span
          ><button class="icon-button" title="Copy code" @click="copyCode">
            <Copy :size="20" />
          </button>
        </div>
        <div class="success-note">
          <CalendarCheck2 :size="21" /><span
            >Present this code at the registration desk on the event day.</span
          >
        </div>
        <RouterLink class="button button-primary" to="/"
          >Discover more events <ArrowRight :size="19"
        /></RouterLink>
      </div>
    </div>
  </section>
</template>
