// composables/useCategories.js
import { ref } from 'vue'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL

export function useCategories() {
  // State
  const categories = ref([])
  const loading = ref(false)
  const error = ref(null)

  /*##########################
    Helper Function
  ##########################*/
  const handleError = (err) => {
    if (err.response && err.response.data) {
      error.value = err.response.data.error || err.response.data.message
    } else {
      error.value = err.message || 'Unbekannter Fehler'
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
      const res = await axios.get(`${API_URL}/categorys`)
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
  const createCategory = async (categoryData) => {
    loading.value = true
    error.value = null
    try {
      const res = await axios.post(`${API_URL}/categorys`, categoryData)

      if (res.status === 201 && res.data) {
        // sichere Variante: komplette Liste neu laden (um DB-Defaults wie color zu holen)
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
  const updateCategory = async (id, categoryData) => {
    loading.value = true
    error.value = null
    try {
      const res = await axios.patch(`${API_URL}/categorys/${id}`, categoryData)

      if (res.status === 200 && res.data) {
        // Liste neu laden (zur Sicherheit)
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
  const deleteCategory = async (id) => {
    loading.value = true
    error.value = null
    try {
      const res = await axios.delete(`${API_URL}/categorys/${id}`)

      if (res.status === 204 || res.status === 200) {
        categories.value = categories.value.filter((c) => c.id !== id)
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
