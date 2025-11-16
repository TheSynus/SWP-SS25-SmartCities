// composables/useCategories.ts
import { ref } from 'vue'
import axios from 'axios'
import type { Category } from '../calendar/useCalendarStore'

const API_URL = import.meta.env.VITE_API_URL

export function useCategories() {
  // State
  const categories = ref<Category[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  /*##########################
    Helper Function
  ##########################*/
  const handleError = (err: unknown) => {
    const defaultMsg = 'Unbekannter Fehler'

    if (axios.isAxiosError(err) && err.response?.data) {
      const data = err.response.data as { error?: string; message?: string }
      error.value = data.error ?? data.message ?? defaultMsg
    } else if (err instanceof Error) {
      error.value = err.message || defaultMsg
    } else {
      error.value = defaultMsg
    }

    console.error('API Error:', error.value)
  }

  /*##########################
    Fetch All Categories
  ##########################*/
  const fetchCategories = async () => {
    loading.value = true
    error.value = null
    try {
      const res = await axios.get<Category[]>(`${API_URL}/categorys`)
      categories.value = res.data
    } catch (err) {
      handleError(err)
    } finally {
      loading.value = false
    }
  }

  /*##########################
    Create Category
  ##########################*/
  const createCategory = async (categoryData: Category) => {
    loading.value = true
    error.value = null
    try {
      const res = await axios.post(`${API_URL}/categorys`, categoryData)

      if (res.status === 201 && res.data) {
        await fetchCategories()
        return true
      }
      return false
    } catch (err) {
      handleError(err)
      return false
    } finally {
      loading.value = false
    }
  }

  /*##########################
    Update Category
  ##########################*/
  const updateCategory = async (id: number, categoryData: Category) => {
    loading.value = true
    error.value = null
    try {
      const res = await axios.patch(`${API_URL}/categorys/${id}`, categoryData)

      if (res.status === 200 && res.data) {
        await fetchCategories()
        return true
      }
      return false
    } catch (err) {
      handleError(err)
      return false
    } finally {
      loading.value = false
    }
  }

  /*##########################
    Delete Category
  ##########################*/
  const deleteCategory = async (id: number) => {
    loading.value = true
    error.value = null
    try {
      const res = await axios.delete(`${API_URL}/categorys/${id}`)

      if (res.status === 204 || res.status === 200) {
        categories.value = categories.value.filter((c: Category) => c.id !== id)
        return true
      }
      return false
    } catch (err) {
      handleError(err)
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    categories,
    loading,
    error,

    // Actions
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  }
}
