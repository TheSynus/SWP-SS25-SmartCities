import { Graph } from "@/models/graph"
import { ref } from "vue"

// Globale reaktive Referenz für alle Graphen
export const graphs = ref<Graph[]>([])

export function useGraphStore() {

  // CSV-Datei parsen und validieren
  const parseCsvFile = async (file: File): Promise<{ x: string[], y: string[] }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = (event) => {
        try {
          const csvText = event.target?.result as string
          const parsed = parseCsvText(csvText)
          resolve(parsed)
        } catch (error) {
          reject(new Error(`CSV-Parsing Fehler: ${error}`))
        }
      }

      reader.onerror = () => {
        reject(new Error('Datei konnte nicht gelesen werden'))
      }

      reader.readAsText(file)
    })
  }

  // CSV-Text parsen
  const parseCsvText = (csvText: string): { x: string[], y: string[] } => {
    const lines = csvText.trim().split('\n')

    if (lines.length < 2) {
      throw new Error('CSV muss mindestens Header und eine Datenzeile enthalten')
    }

    // Header parsen (erste Zeile)
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))

    if (headers.length < 2) {
      throw new Error('CSV muss mindestens 2 Spalten haben (X und Y)')
    }

    const xData: string[] = []
    const yData: string[] = []

    // Datenzeilen parsen (ab zweite Zeile)
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''))

      if (values.length >= 2 && values[0] && values[1]) {
        xData.push(values[0])
        yData.push(values[1])
      }
    }

    if (xData.length === 0) {
      throw new Error('Keine gültigen Datenzeilen gefunden')
    }

    return { x: xData, y: yData }
  }

  // Neuen Graph erstellen
  const createGraph = async (file: File, type: string): Promise<number> => {
    try {
      // CSV parsen
      const { x, y } = await parseCsvFile(file)

      // Neue Graph-ID generieren
      const graphId = graphs.value.length > 0
        ? Math.max(...graphs.value.map(g => g.graph_id)) + 1
        : 1

      // Graph erstellen
      const newGraph = new Graph(graphId, type, x, y)

      // Zu Liste hinzufügen
      graphs.value.push(newGraph)

      return newGraph.graph_id

    } catch (error) {
      console.error('Fehler beim Erstellen des Graphen:', error)
      throw error
    }
  }

  // Graph löschen
  const deleteGraph = (graphId: number): boolean => {
    const index = graphs.value.findIndex(g => g.graph_id === graphId)
    if (index !== -1) {
      graphs.value.splice(index, 1)
      return true
    }
    return false
  }

  // Graph nach ID finden
  const getGraphById = (graphId: number): Graph | undefined => {
    return graphs.value.find(g => g.graph_id === graphId)
  }

  // Alle Graphen nach Typ filtern
  const getGraphsByType = (type: string): Graph[] => {
    return graphs.value.filter(g => g.type === type)
  }

  // CSV-Datei validieren (ohne zu parsen)
  const validateCsvFile = (file: File): { valid: boolean, error?: string } => {
    // Dateityp prüfen
    if (!file.name.toLowerCase().endsWith('.csv') && file.type !== 'text/csv') {
      return { valid: false, error: 'Bitte wählen Sie eine CSV-Datei aus' }
    }

    // Dateigröße prüfen (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return { valid: false, error: 'Datei ist zu groß (max. 5MB)' }
    }

    return { valid: true }
  }


  return {
    createGraph,
    deleteGraph,
    getGraphById,
    getGraphsByType,
    parseCsvFile,
    validateCsvFile
  }
}
