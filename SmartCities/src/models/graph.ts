export class Graph {
  public graph_id: number
  public type: string
  public data: GraphData[]

  /**
   *
   */
  constructor(graphId: number, type: string, data: GraphData[]) {
    this.graph_id = graphId
    this.type = type
    this.data = data
  }
}

export class GraphData {
  public x: string
  public y: string

  constructor(x: string, y: string) {
    this.x = x
    this.y = y
  }
}

export interface GraphDTO {
  id: number
  title: string
  type: string
}

export interface GraphDataDTO {
  graph_id: number
  id: number
  x_comp: string
  y_comp: string
}

export interface GraphResultDTO extends GraphDTO {
  data_points: GraphDataDTO[]
}
