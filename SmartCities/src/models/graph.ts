export class Graph {
  public graph_id: number
  public type: string
  public title: string
  public data: GraphData[]

  /**
   *
   */
  constructor(graphId: number, type: string, title: string, data: GraphData[]) {
    this.graph_id = graphId
    this.type = type
    this.title = title
    this.data = data
  }
}

export class GraphData {
  public x_comp: string
  public y_comp: string

  constructor(x: string, y: string) {
    this.x_comp = x
    this.y_comp = y
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
