export class NinaWarning {
  public url: string
  public type: WarningType
  public headline: string
  public severity: WarningSeverity

  /**
   *
   */
  constructor(url: string, type: WarningType, headline: string, severity: WarningSeverity) {
    this.url = url
    this.type = type
    this.headline = headline
    this.severity = severity
  }
}

export enum WarningType {
  ALERT = 'ALERT',
}

export enum WarningSeverity {
  MINOR = 'Minor',
}
