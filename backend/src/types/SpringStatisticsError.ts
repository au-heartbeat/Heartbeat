export class SpringStatisticsError extends Error {
  constructor(typeName: string) {
    super(`unsupported type: ${typeName}.`);
  }
}
