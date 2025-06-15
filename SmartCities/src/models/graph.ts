export class Graph {
  public graph_id: number
  public type: string
  public x_data: string[]
  public y_data: string[]

  /**
   *
   */
  constructor(graphId: number, type: string, xData: string[], yData: string[]) {
    this.graph_id = graphId
    this.type = type
    this.x_data = xData
    this.y_data = yData
  }
}
