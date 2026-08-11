<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ArrowRight,
  CalendarDays,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  UserRound,
} from '@lucide/vue'
import { getAuthError, loginAccount, registerAccount } from '../services/auth'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const error = ref('')
const showPassword = ref(false)
const form = reactive({ name: '', email: '', password: '', confirmPassword: '' })

const isRegister = computed(() => route.name === 'account-register')

watch(
  () => route.name,
  () => {
    error.value = ''
    form.password = ''
    form.confirmPassword = ''
  },
)

async function submit() {
  error.value = ''

  if (isRegister.value && form.password !== form.confirmPassword) {
    error.value = 'The passwords do not match.'
    return
  }

  loading.value = true
  try {
    if (isRegister.value) {
      await registerAccount(form)
    } else {
      await loginAccount(form)
    }

    await router.replace(route.query.redirect || '/admin')
  } catch (authError) {
    error.value = getAuthError(authError)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section class="auth-page">
    <div class="auth-decoration auth-decoration-one"></div>
    <div class="auth-decoration auth-decoration-two"></div>

    <div class="auth-card">
      <RouterLink class="auth-brand" to="/">
        <span><CalendarDays :size="23" /></span>
        evently
      </RouterLink>

      <div class="auth-heading">
        <span class="section-kicker">{{ isRegister ? 'CREATE AN ACCOUNT' : 'WELCOME BACK' }}</span>
        <h1>{{ isRegister ? 'Join Evently today' : 'Sign in to Evently' }}</h1>
        <p>
          {{
            isRegister
              ? 'Create your account to manage events and registrations.'
              : 'Enter your account details to continue.'
          }}
        </p>
      </div>

      <form class="auth-form" @submit.prevent="submit">
        <div v-if="isRegister" class="field-group">
          <label for="accountName">Full name</label>
          <div class="auth-input">
            <UserRound :size="19" />
            <input
              id="accountName"
              v-model.trim="form.name"
              autocomplete="name"
              placeholder="Juan Dela Cruz"
              required
            />
          </div>
        </div>

        <div class="field-group">
          <label for="accountEmail">Email address</label>
          <div class="auth-input">
            <Mail :size="19" />
            <input
              id="accountEmail"
              v-model.trim="form.email"
              type="email"
              autocomplete="email"
              placeholder="you@example.com"
              required
            />
          </div>
        </div>

        <div class="field-group">
          <label for="accountPassword">Password</label>
          <div class="auth-input">
            <LockKeyhole :size="19" />
            <input
              id="accountPassword"
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              :autocomplete="isRegister ? 'new-password' : 'current-password'"
              minlength="6"
              placeholder="At least 6 characters"
              required
            />
            <button
              class="password-toggle"
              type="button"
              :aria-label="showPassword ? 'Hide password' : 'Show password'"
              @click="showPassword = !showPassword"
            >
              <EyeOff v-if="showPassword" :size="18" />
              <Eye v-else :size="18" />
            </button>
          </div>
        </div>

        <div v-if="isRegister" class="field-group">
          <label for="confirmPassword">Confirm password</label>
          <div class="auth-input">
            <LockKeyhole :size="19" />
            <input
              id="confirmPassword"
              v-model="form.confirmPassword"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="new-password"
              minlength="6"
              placeholder="Enter the password again"
              required
            />
          </div>
        </div>

        <div v-if="error" class="auth-error">{{ error }}</div>

        <button class="button button-primary button-full" :disabled="loading">
          {{ loading ? 'Please wait...' : isRegister ? 'Create account' : 'Sign in' }}
          <ArrowRight v-if="!loading" :size="18" />
        </button>
      </form>

      <p class="auth-switch">
        {{ isRegister ? 'Already have an account?' : 'New to Evently?' }}
        <RouterLink :to="isRegister ? '/login' : '/register-account'">
          {{ isRegister ? 'Sign in' : 'Create an account' }}
        </RouterLink>
      </p>

      <p class="auth-privacy"><ShieldCheck :size="16" /> Protected by Firebase Authentication</p>
    </div>
  </section>
</template>

<style scoped>
.auth-page {
  position: relative;
  min-height: calc(100vh - 76px);
  display: grid;
  place-items: center;
  padding: 70px 20px;
  background: linear-gradient(145deg, var(--soft), var(--surface));
  overflow: hidden;
}

.auth-decoration {
  position: absolute;
  border-radius: 50%;
  filter: blur(2px);
}

.auth-decoration-one {
  width: 380px;
  height: 380px;
  top: -190px;
  right: -120px;
  background: radial-gradient(circle, rgba(164, 60, 255, 0.22), transparent 68%);
}

.auth-decoration-two {
  width: 330px;
  height: 330px;
  bottom: -190px;
  left: -120px;
  background: radial-gradient(circle, rgba(255, 125, 92, 0.19), transparent 68%);
}

.auth-card {
  position: relative;
  z-index: 2;
  width: min(470px, 100%);
  padding: 38px;
  border: 1px solid var(--line);
  border-radius: 27px;
  background: var(--surface);
  box-shadow: var(--shadow);
}

.auth-brand {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  margin-bottom: 28px;
  font-family: 'Manrope', sans-serif;
  font-size: 21px;
  font-weight: 800;
}

.auth-brand > span {
  width: 39px;
  height: 39px;
  display: grid;
  place-items: center;
  color: white;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
}

.auth-heading h1 {
  margin: 8px 0 8px;
  font-size: 34px;
  letter-spacing: -1.5px;
}

.auth-heading p {
  margin-bottom: 25px;
}

.auth-input {
  position: relative;
  display: flex;
  align-items: center;
}

.auth-input > svg {
  position: absolute;
  left: 14px;
  color: var(--muted);
}

.auth-input input {
  width: 100%;
  min-height: 51px;
  padding: 0 44px;
  color: var(--ink);
  border: 1px solid var(--line);
  border-radius: 12px;
  outline: none;
  background: var(--soft);
}

.auth-input input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 4px rgba(109, 74, 255, 0.1);
}

.password-toggle {
  position: absolute;
  right: 8px;
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  color: var(--muted);
  border-radius: 9px;
  background: transparent;
}

.auth-error {
  margin-bottom: 17px;
  padding: 12px 14px;
  color: #a32948;
  border: 1px solid #f0c3cf;
  border-radius: 11px;
  background: #fff5f8;
  font-size: 13px;
}

.auth-switch,
.auth-privacy {
  margin: 20px 0 0;
  text-align: center;
  font-size: 13px;
}

.auth-switch a {
  color: var(--primary);
  font-weight: 800;
}

.auth-privacy {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-top: 14px;
  font-size: 12px;
}

@media (max-width: 520px) {
  .auth-card {
    padding: 28px 22px;
  }

  .auth-heading h1 {
    font-size: 30px;
  }
}
</style>
