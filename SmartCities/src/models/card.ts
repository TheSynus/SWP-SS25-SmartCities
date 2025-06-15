export class Card {
  public id: number;
  public name: string;
  public type: string;
  public index: number;

  /**
   *
   */
  constructor(id: number, name: string, type: string, index: number) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.index = index;
  }
}
