import { Graph, GraphData, type GraphDTO, type GraphResultDTO } from '@/models/graph'
import axios from 'axios'
import { ref } from 'vue'

// Globale reaktive Referenz für alle Graphen
export const graphs = ref<Graph[]>([])

export function useGraphStore() {
  // CSV-Datei parsen und validieren
  const parseCsvFile = async (file: File): Promise<GraphData[]> => {
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
  const parseCsvText = (csvText: string): GraphData[] => {
    const lines = csvText.trim().split('\n')

    if (lines.length < 2) {
      throw new Error('CSV muss mindestens Header und eine Datenzeile enthalten')
    }

    // Header parsen (erste Zeile)
    const headers = lines[0].split(';').map((h) => h.trim().replace(/"/g, ''))

    if (headers.length < 2) {
      throw new Error('CSV muss mindestens 2 Spalten haben (X und Y)')
    }

    const data: GraphData[] = []

    // Datenzeilen parsen (ab zweite Zeile)
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(';').map((v) => v.trim().replace(/"/g, ''))

      if (values.length >= 2 && values[0] && values[1]) {
        data.push(new GraphData(values[0], values[1]))
      }
    }

    if (data.length === 0) {
      throw new Error('Keine gültigen Datenzeilen gefunden')
    }

    return data
  }

  // Neuen Graph erstellen
  const createGraph = async (file: File, type: string): Promise<Graph> => {
    try {
      // CSV parsen
      const data = await parseCsvFile(file)

      // Graph Objekt in DB speichern
      const graphResponse = await axios.post<GraphDTO>(`${import.meta.env.VITE_API_URL}/graphs`, {
        title: 'Test',
        type: type,
      })

      if (graphResponse.data && graphResponse.data.id) {
        // Daten in DB speichern
        // TODO: Schleife in Backend
        for (const dat of data) {
          await axios.post(`${import.meta.env.VITE_API_URL}/graphs/${graphResponse.data.id}/data`, {
            x_comp: dat.x,
            y_comp: dat.y,
          })
        }

        const newGraph = new Graph(graphResponse.data.id, type, data)

        // Zu Liste hinzufügen
        graphs.value.push(newGraph)

        return newGraph
      } else {
        throw new Error('Speichern des Graphen nicht möglich')
      }
    } catch (error) {
      console.error('Fehler beim Erstellen des Graphen:', error)
      throw error
    }
  }

  // Daten für Graphen holen
  const getDataForGraph = async (graphId: number): Promise<GraphData[]> => {
    const result = await axios.get<GraphResultDTO>(
      `${import.meta.env.VITE_API_URL}/graphs/${graphId}`,
    )

    const retVal = result.data.data_points.map((dat) => {
      return new GraphData(dat.x_comp, dat.y_comp)
    })

    return retVal
  }

  // Graph löschen
  const deleteGraph = (graphId: number): boolean => {
    const index = graphs.value.findIndex((g) => g.graph_id === graphId)
    if (index !== -1) {
      graphs.value.splice(index, 1)
      return true
    }
    return false
  }

  // Graph nach ID finden
  const getGraphById = (graphId: number): Graph | undefined => {
    return graphs.value.find((g) => g.graph_id === graphId)
  }

  // Alle Graphen nach Typ filtern
  const getGraphsByType = (type: string): Graph[] => {
    return graphs.value.filter((g) => g.type === type)
  }

  // CSV-Datei validieren (ohne zu parsen)
  const validateCsvFile = (file: File): { valid: boolean; error?: string } => {
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
    validateCsvFile,
    getDataForGraph,
  }
}
