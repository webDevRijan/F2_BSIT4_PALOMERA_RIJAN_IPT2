import { computed, onMounted, ref } from 'vue'

const theme = ref('light')
let initialized = false

function applyTheme(value) {
  theme.value = value
  document.documentElement.dataset.theme = value
  document.documentElement.style.colorScheme = value
  localStorage.setItem('evently-theme', value)
}

function initializeTheme() {
  if (initialized) return

  const savedTheme = localStorage.getItem('evently-theme')
  const devicePrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

  applyTheme(savedTheme || (devicePrefersDark ? 'dark' : 'light'))
  initialized = true
}

export function useTheme() {
  onMounted(initializeTheme)

  const isDark = computed(() => theme.value === 'dark')

  function toggleTheme() {
    applyTheme(isDark.value ? 'light' : 'dark')
  }

  return { isDark, theme, toggleTheme }
}
