export class Card {
  public id: number;
  public name: string;
  public type: string;
  public index: number;
  public graphId?: number;

  /**
   *
   */
  constructor(id: number, name: string, type: string, index: number, chartId?: number) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.index = index;
    this.graphId = chartId
  }
}
