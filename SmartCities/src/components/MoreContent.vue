<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'

type RouteTargets =
  | { type: 'name'; settings: string; imprint: string; contact?: string }
  | { type: 'path'; settings: string; imprint: string; contact?: string }

const props = defineProps<{
  title?: string
  routes?: RouteTargets
  // Wenn true, wird für "Kontaktformular" ein Modal innerhalb der Komponente geöffnet.
  // Falls false und routes.contact existiert, wird dorthin navigiert.
  useModalForContact?: boolean
}>()

const emit = defineEmits<{
  (e: 'submitContact', payload: { name: string; email: string; message: string }): void
  (e: 'navigate', to: 'settings' | 'imprint' | 'contact'): void
}>()

const router = useRouter()

// UI state – Kontaktmodal
const contactOpen = ref(false)

// Kontaktformular-Model
const name = ref('')
const email = ref('')
const message = ref('')
const sending = ref(false)
const formTouched = ref(false)

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const errors = computed(() => {
  const e: Record<string, string | null> = { name: null, email: null, message: null }
  if (!name.value.trim()) e.name = 'Bitte gib deinen Namen ein.'
  if (!email.value.trim()) e.email = 'Bitte gib deine E-Mail ein.'
  else if (!emailRegex.test(email.value)) e.email = 'Bitte gib eine gültige E-Mail ein.'
  if (!message.value.trim()) e.message = 'Bitte beschreibe dein Anliegen.'
  return e
})

const formValid = computed(() => !errors.value.name && !errors.value.email && !errors.value.message)

// Helper: Formular zurücksetzen
function resetContactForm(resetFields = true) {
  formTouched.value = false
  if (resetFields) {
    name.value = ''
    email.value = ''
    message.value = ''
  }
}

// Modal kontrolliert öffnen/schließen
function openContactModal() {
  resetContactForm(true)
  contactOpen.value = true
}
function closeContactModal() {
  contactOpen.value = false
  resetContactForm(true)
}

// Beim Öffnen des Modals Fehlermeldungen zurücksetzen
watch(contactOpen, (isOpen) => {
  if (isOpen) formTouched.value = false
})

function go(target: 'settings' | 'imprint' | 'contact') {
  emit('navigate', target)
  const r = props.routes
  if (!r) {
    if (target === 'contact') openContactModal()
    return
  }
  if (target === 'contact' && props.useModalForContact !== false) {
    openContactModal()
    return
  }

  if (r.type === 'name') {
    const nameMap = {
      settings: r.settings,
      imprint: r.imprint,
      contact: r.contact,
    } as const
    const routeName = nameMap[target]
    if (routeName) router.push({ name: routeName }).catch(() => {})
    else if (target === 'contact') openContactModal()
  } else {
    const pathMap = {
      settings: r.settings,
      imprint: r.imprint,
      contact: r.contact,
    } as const
    const path = pathMap[target]
    if (path) router.push(path).catch(() => {})
    else if (target === 'contact') openContactModal()
  }
}

async function submitContact() {
  formTouched.value = true
  if (!formValid.value) return
  try {
    sending.value = true
    emit('submitContact', { name: name.value.trim(), email: email.value.trim(), message: message.value.trim() })
    closeContactModal()
  } finally {
    sending.value = false
  }
}
</script>

<template>
  <!-- Force Dark Mode inside the component -->
  <section class="relative dark w-full h-full bg-gray-900 text-gray-100">
    <header class="mb-4">
      <h2 class="text-2xl font-semibold text-gray-100">
        {{ props.title ?? 'Mehr' }}
      </h2>
      <p class="text-sm text-gray-400">Schnellzugriff auf weitere Bereiche</p>
    </header>

    <!-- Stacked menu cards -->
    <div class="grid grid-cols-1 gap-4">
      <!-- Einstellungen -->
      <button
        type="button"
        @click="go('settings')"
        class="group w-full rounded-2xl border border-gray-700 bg-gray-800 p-4 text-left shadow-sm hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400 focus:ring-offset-gray-900"
      >
        <div class="flex items-center gap-3">
          <div class="rounded-xl p-2 bg-gray-700 group-hover:bg-gray-600 transition-colors">
            <svg class="w-6 h-6 text-gray-200" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                d="M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm8.66 3a8.66 8.66 0 0 0-.17-1.73l2.03-1.58-2-3.46-2.43.97a8.6 8.6 0 0 0-1.5-.87L14.5 2h-5l-.99 2.33c-.52.2-1.02.45-1.5.74l-2.5-1-2 3.46 2.04 1.6c-.08.56-.13 1.13-.13 1.7s.05 1.14.15 1.7l-2.06 1.6 2 3.46 2.49-1a8.6 8.6 0 0 0 1.5.86L9.5 22h5l.99-2.34c.52-.2 1.02-.45 1.5-.74l2.5 1 2-3.46-2.04-1.6c.1-.56.15-1.13.15-1.7Z" />
            </svg>
          </div>
          <div>
            <div class="font-medium text-gray-100">Einstellungen</div>
            <div class="text-sm text-gray-400">Benachrichtigungen, Layout &amp; Konto</div>
          </div>
        </div>
      </button>

      <!-- Impressum -->
      <button
        type="button"
        @click="go('imprint')"
        class="group w-full rounded-2xl border border-gray-700 bg-gray-800 p-4 text-left shadow-sm hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400 focus:ring-offset-gray-900"
      >
        <div class="flex items-center gap-3">
          <div class="rounded-xl p-2 bg-gray-700 group-hover:bg-gray-600 transition-colors">
            <svg class="w-6 h-6 text-gray-200" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Zm7 0v6h6" />
            </svg>
          </div>
          <div>
            <div class="font-medium text-gray-100">Impressum</div>
            <div class="text-sm text-gray-400">Angaben gemäß § 5 TMG</div>
          </div>
        </div>
      </button>

      <!-- Kontaktformular -->
      <button
        type="button"
        @click="go('contact')"
        class="group w-full rounded-2xl border border-gray-700 bg-gray-800 p-4 text-left shadow-sm hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400 focus:ring-offset-gray-900"
      >
        <div class="flex items-center gap-3">
          <div class="rounded-xl p-2 bg-gray-700 group-hover:bg-gray-600 transition-colors">
            <svg class="w-6 h-6 text-gray-200" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                d="M4 6h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Zm0 2 8 5 8-5" />
            </svg>
          </div>
          <div>
            <div class="font-medium text-gray-100">Kontakt</div>
            <div class="text-sm text-gray-400">Schreib uns eine Nachricht</div>
          </div>
        </div>
      </button>
    </div>

    <!-- Kontaktformular Modal -->
    <div class="relative">
      <div
        v-if="contactOpen"
        class="absolute inset-0 z-20 flex items-center justify-center p-4 h-full"
        aria-modal="true"
        role="dialog"
      >
        <div class="relative w-full max-w-lg rounded-2xl bg-gray-800 border border-gray-700 shadow-xl">
          <header class="flex items-center justify-between p-4 border-b border-gray-700">
            <h3 class="text-lg font-semibold text-gray-100">Kontaktformular</h3>
            <button
              type="button"
              class="p-2 rounded-lg hover:bg-gray-700 text-gray-300"
              @click="closeContactModal"
              aria-label="Modal schließen"
            >
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                  d="m6 6 12 12M6 18 18 6" />
              </svg>
            </button>
          </header>

          <form class="p-4 space-y-4" @submit.prevent="submitContact">
            <div>
              <label class="block text-sm font-medium text-gray-200">Name</label>
              <input
                v-model="name"
                type="text"
                class="mt-1 w-full rounded-lg border border-gray-700 bg-gray-900 text-gray-100 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500"
              />
              <p v-if="formTouched && errors.name" class="mt-1 text-sm text-red-400">{{ errors.name }}</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-200">E-Mail</label>
              <input
                v-model="email"
                type="email"
                class="mt-1 w-full rounded-lg border border-gray-700 bg-gray-900 text-gray-100 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500"
              />
              <p v-if="formTouched && errors.email" class="mt-1 text-sm text-red-400">{{ errors.email }}</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-200">Nachricht</label>
              <textarea
                v-model="message"
                rows="4"
                class="mt-1 w-full rounded-lg border border-gray-700 bg-gray-900 text-gray-100 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500"
              />
              <p v-if="formTouched && errors.message" class="mt-1 text-sm text-red-400">{{ errors.message }}</p>
            </div>

            <div class="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                class="px-4 py-2 rounded-lg border border-gray-600 text-gray-100 hover:bg-gray-700"
                @click="closeContactModal"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                :disabled="sending"
                class="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ sending ? 'Senden…' : 'Senden' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
button,
input,
textarea {
  -webkit-tap-highlight-color: transparent;
}
</style>
