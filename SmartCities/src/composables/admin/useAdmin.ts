import { ref } from 'vue'

const isAdmin = ref(true)

export function useAdmin() {
  return {
    isAdmin
  }
}
