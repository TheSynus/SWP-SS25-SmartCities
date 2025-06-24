export class Card {
  public id: number;
  public title: string;
  public type: string;
  public position: number;
  public graph_id?: number;

  /**
   *
   */
  constructor(id: number, title: string, type: string, position: number, chartId?: number) {
    this.id = id;
    this.title = title;
    this.type = type;
    this.position = position;
    this.graph_id = chartId
  }
}
