// composables/map/useCategories.js
import { ref } from 'vue'

export function useCategories() {
  const categories = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Mock-Daten für Kategorien
  const mockCategories = [
    { id: 1, name: 'Restaurants', color: '#FF6B6B', active: true, icon: '🍴' },
    { id: 2, name: 'Hotels', color: '#4ECDC4', active: true, icon: '🏨' },
    { id: 3, name: 'Sehenswürdigkeiten', color: '#45B7D1', active: true, icon: '📍' },
    { id: 4, name: 'Shopping', color: '#96CEB4', active: false, icon: '🛍️' },
    { id: 5, name: 'Parks', color: '#FECA57', active: false, icon: '🌳' },
    { id: 6, name: 'Transport', color: '#FF9FF3', active: false, icon: '🚌' }
  ]

  const loadCategories = async () => {
    loading.value = true
    error.value = null
    
    try {
      // Simuliere API-Aufruf
      await new Promise(resolve => setTimeout(resolve, 500))
      categories.value = [...mockCategories]
    } catch (err) {
      error.value = err.message
      console.error('Fehler beim Laden der Kategorien:', err)
    } finally {
      loading.value = false
    }
  }

  const createCategory = async (categoryData) => {
    try {
      const newCategory = {
        id: Date.now(),
        ...categoryData,
        active: true
      }
      categories.value.push(newCategory)
      return newCategory
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  const updateCategory = async (id, updates) => {
    try {
      const index = categories.value.findIndex(cat => cat.id === id)
      if (index !== -1) {
        categories.value[index] = { ...categories.value[index], ...updates }
        return categories.value[index]
      }
      throw new Error('Kategorie nicht gefunden')
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  const deleteCategory = async (id) => {
    try {
      const index = categories.value.findIndex(cat => cat.id === id)
      if (index !== -1) {
        categories.value.splice(index, 1)
        return true
      }
      throw new Error('Kategorie nicht gefunden')
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  return {
    categories,
    loading,
    error,
    loadCategories,
    createCategory,
    updateCategory,
    deleteCategory
  }
}