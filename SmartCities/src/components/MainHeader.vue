<template>
  <header
    class="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm"
  >
    <div class="max-w-full px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-14 sm:h-16 lg:h-18">
        <!-- Logo/Brand -->
        <div class="flex items-center space-x-4">
          <router-link to="/">
            <div class="flex-shrink-0">
              <h1 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                Smart Cities
              </h1>
            </div>
          </router-link>
        </div>

        <!-- Desktop Navigation -->
        <nav class="hidden md:flex items-center space-x-8" v-if="isAdmin">
          <router-link
            to="/dashboard"
            class="text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 px-3 py-2 text-sm font-medium transition-colors"
            active-class="text-blue-600 dark:text-blue-400"
          >
            Dashboard
          </router-link>
          <router-link
            to="/map"
            class="text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 px-3 py-2 text-sm font-medium transition-colors"
            active-class="text-blue-600 dark:text-blue-400"
          >
            Karte
          </router-link>

          <router-link
            to="/calendar"
            class="text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 px-3 py-2 text-sm font-medium transition-colors"
            active-class="text-blue-600 dark:text-blue-400"
          >
            Kalender
          </router-link>
        </nav>

        <!-- Right side items -->
        <div class="flex items-center space-x-4">
          <!-- Dark Mode Toggle -->
          <button
            @click="toggleDarkMode"
            class="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Toggle dark mode"
          >
            <svg
              v-if="isDark"
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
            <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
              />
            </svg>
          </button>

          <!-- User Menu -->
          <div class="relative">
            <button
              class="flex items-center space-x-2 p-2 text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              @click="toggleAdmin"
            >
              <div class="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span class="text-white text-sm font-medium">{{ displayIcon }}</span>
              </div>
              <span class="hidden sm:block text-sm font-medium">{{ displayName }}</span>
            </button>
          </div>

          <!-- Mobile menu button -->
          <button
            @click="toggleMobileMenu"
            class="md:hidden p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Toggle menu"
          >
            <svg
              v-if="!showMobileMenu"
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
            <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- Mobile Navigation -->
      <div
        v-show="showMobileMenu"
        class="md:hidden border-t border-gray-200 dark:border-gray-700 py-4"
      >
        <nav class="flex flex-col space-y-2">
          <router-link
            to="/dashboard"
            class="text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 px-3 py-2 text-base font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            active-class="text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
            @click="closeMobileMenu"
          >
            Dashboard
          </router-link>
          <router-link
            to="/map"
            class="text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 px-3 py-2 text-base font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            active-class="text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
            @click="closeMobileMenu"
          >
            Karte
          </router-link>

          <router-link
            to="/calendar"
            class="text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 px-3 py-2 text-base font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            active-class="text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
            @click="closeMobileMenu"
          >
            Kalender
          </router-link>
        </nav>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const showMobileMenu = ref(false)
const isDark = ref(false)
const isAdmin = ref(true)
const displayIcon = ref('A')
const displayName = ref('Admin')

const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value
}

const closeMobileMenu = () => {
  showMobileMenu.value = false
}

const toggleDarkMode = () => {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark', isDark.value)

  // Save preference to localStorage
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}

const toggleAdmin = () => {
  isAdmin.value = !isAdmin.value
  displayName.value = isAdmin.value ? 'Admin' : 'User'
  displayIcon.value = isAdmin.value ? 'A' : 'U'
}

onMounted(() => {
  // Check for saved dark mode preference
  const savedTheme = localStorage.getItem('theme')
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

  isDark.value = savedTheme === 'dark' || (!savedTheme && systemPrefersDark)
  document.documentElement.classList.toggle('dark', isDark.value)
})
</script>
