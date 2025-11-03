import { ref } from 'vue'
import { Card } from '@/models/card'
import axios from 'axios'

export const cards = ref<Card[]>([])

export function useCardStore() {
  // const storageKey = 'cards'

  const getCards = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/cards`)

      console.log('Cards', response.data)

      cards.value = response.data
    } catch (error) {
      console.error('Fehler beim Abrufen der Cards:', error)
      throw error
    }
  }

  const addCard = async (
    title: string,
    type: string,
    position: number,
    graph_id: number | null,
  ) => {
    try {
      const response = await axios.post<Card>(`${import.meta.env.VITE_API_URL}/cards`, {
        title,
        type,
        position,
        graph_id,
      })

      const newCard = response.data

      const cardsCopy = cards.value.slice(0)

      cardsCopy.forEach((card) => {
        if (card.position >= newCard.position) {
          card.position++
          updateCard(card)
        }
      })

      cardsCopy.push(newCard)
      cardsCopy.sort((a, b) => a.position - b.position)

      cards.value = cardsCopy
    } catch (error) {
      console.error('Fehler beim Speichern der Card:', error)
      throw error
    }
  }

  const deleteCard = async (card: Card) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/cards/${card.id}`)

      // Graph Daten löschen
      if (card.graph_id !== undefined && card.graph_id !== null) {
        await axios.delete(`${import.meta.env.VITE_API_URL}/graphs/${card.graph_id}`)
      }

      // Card aus lokaler Liste entfernen
      const existing = cards.value.filter((crd) => crd.id !== card.id)
      for (let i = 0; i < existing.length; i++) {
        const crd = existing[i]
        crd.position = i
        updateCard(crd).then()
      }
      cards.value = existing
    } catch (error) {
      console.error('Fehler beim Löschen der Card:', error)
      throw error
    }
  }

  const reorderCards = (updateCards: Card[]) => {
    // Indizes basierend auf Array-Position setzen
    updateCards.forEach((card, index) => {
      card.position = index
      updateCard(card)
    })

    // Reaktive Referenz aktualisieren
    cards.value = updateCards

    return cards.value
  }

  const updateCard = async (card: Card) => {
    try {
      await axios.patch(`${import.meta.env.VITE_API_URL}/cards/${card.id}`, {
        title: card.title,
        position: card.position,
        type: card.type,
        graph_id: card.graph_id,
      })
    } catch (error) {
      console.error('Fehler beim Aktualisieren der Card:', error)
      throw error
    }
  }

  return {
    getCards,
    addCard,
    deleteCard,
    reorderCards,
    updateCard
  }
}
