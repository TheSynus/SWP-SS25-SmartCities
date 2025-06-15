import { ref } from 'vue'
import { Card } from '@/models/card'

export const cards = ref<Card[]>([])

export function useCardStore() {
  // const storageKey = 'cards'

  const getCards = () => {
    return cards.value
  }

const addCard = (cardData: { id: number; name: string; type: string }, addIndex: number, graphId?: number) => {
    // Alle Karten mit Index >= addIndex um 1 erhöhen
    cards.value.forEach((card) => {
      if (card.index >= addIndex) {
        card.index += 1
      }
    })

    // Neue Karte erstellen
    const newCard = new Card(cardData.id, cardData.name, cardData.type, addIndex, graphId)

    // Karte hinzufügen und sortieren
    cards.value.push(newCard)
    cards.value.sort((a, b) => a.index - b.index)

    // In localStorage speichern
    // localStorage.setItem(storageKey, JSON.stringify(cards.value))

    console.log('NewCards', cards.value)

    return cards.value
  }

  const deleteCard = (id: number) => {
    // Karte mit der ID entfernen
    const existing = cards.value.filter((card) => card.id !== id)

    // Indizes neu setzen
    for (let i = 0; i < existing.length; i++) {
      existing[i].index = i
    }

    // Reaktive Referenz aktualisieren
    cards.value = existing

    // Speichern
    // localStorage.setItem(storageKey, JSON.stringify(cards.value))

    return cards.value
  }

  const reorderCards = (updateCards: Card[]) => {
    // Indizes basierend auf Array-Position setzen
    updateCards.forEach((card, index) => {
      card.index = index
    })

    // Reaktive Referenz aktualisieren
    cards.value = updateCards

    // In localStorage speichern
    // localStorage.setItem(storageKey, JSON.stringify(cards.value))

    return cards.value
  }

  return {
    getCards,
    addCard,
    deleteCard,
    reorderCards
  }
}
